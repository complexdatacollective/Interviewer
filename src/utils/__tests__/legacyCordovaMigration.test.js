import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@capacitor/core', () => ({ registerPlugin: vi.fn(() => ({})) }));
vi.mock('@capacitor/filesystem', () => ({
  Filesystem: {},
  Directory: { Data: 'DATA', Library: 'LIBRARY' },
}));

import {
  MIGRATION_FLAG_KEY,
  mergePersistedState,
  migrateLegacyCordovaData,
  moveLegacyIosProtocols,
  PERSIST_KEY,
} from '../legacyCordovaMigration';

// The shape redux-persist writes: each slice is itself a JSON string.
const persisted = (slices) =>
  JSON.stringify(
    Object.fromEntries(
      Object.entries(slices).map(([key, value]) => [
        key,
        JSON.stringify(value),
      ]),
    ),
  );

const read = (raw) =>
  Object.fromEntries(
    Object.entries(JSON.parse(raw)).map(([key, value]) => [
      key,
      JSON.parse(value),
    ]),
  );

const legacyRaw = persisted({
  installedProtocols: { 'p-old': { name: 'Old protocol' } },
  sessions: { 's-old': { protocolUID: 'p-old', caseId: 'old case' } },
  deviceSettings: { description: 'Field iPad 3', interfaceScale: 120 },
  dismissedUpdates: ['6.5.3'],
  activeSessionId: 's-old',
  router: { location: { pathname: '/session/s-old' } },
  _persist: { version: -1, rehydrated: true },
});

const memoryStorage = (initial = {}) => {
  const values = new Map(Object.entries(initial));
  return {
    values,
    getItem: vi.fn(async (key) => (values.has(key) ? values.get(key) : null)),
    setItem: vi.fn(async (key, value) => {
      values.set(key, value);
      return value;
    }),
  };
};

// A Capacitor Filesystem over a set of existing paths, keyed `DIRECTORY:path`.
const memoryFilesystem = (paths) => {
  const existing = new Set(paths);
  return {
    existing,
    stat: vi.fn(async ({ path, directory }) => {
      if (!existing.has(`${directory}:${path}`)) {
        throw Object.assign(new Error('does not exist'), {
          code: 'OS-PLUG-FILE-0008',
        });
      }
      return {};
    }),
    readdir: vi.fn(async ({ path, directory }) => ({
      files: [...existing]
        .filter((entry) => entry.startsWith(`${directory}:${path}/`))
        .map((entry) => entry.slice(`${directory}:${path}/`.length))
        .filter((name) => !name.includes('/'))
        .map((name) => ({
          name,
          type: name.endsWith('.txt') ? 'file' : 'directory',
        })),
    })),
    mkdir: vi.fn(async ({ path, directory }) => {
      existing.add(`${directory}:${path}`);
    }),
    rename: vi.fn(async ({ from, directory, to, toDirectory }) => {
      existing.delete(`${directory}:${from}`);
      existing.add(`${toDirectory}:${to}`);
    }),
  };
};

describe('mergePersistedState', () => {
  it('uses the legacy store as-is when the new store is empty', () => {
    expect(mergePersistedState(legacyRaw, null)).toBe(legacyRaw);
  });

  it('keeps protocols and sessions from both stores, and the new navigation state', () => {
    const currentRaw = persisted({
      installedProtocols: { 'p-new': { name: 'New protocol' } },
      sessions: { 's-new': { protocolUID: 'p-new' } },
      deviceSettings: { description: 'Unknown device', interfaceScale: 100 },
      dismissedUpdates: ['6.6.2'],
      activeSessionId: null,
      router: { location: { pathname: '/' } },
      _persist: { version: -1, rehydrated: true },
    });

    expect(read(mergePersistedState(legacyRaw, currentRaw))).toEqual({
      installedProtocols: {
        'p-old': { name: 'Old protocol' },
        'p-new': { name: 'New protocol' },
      },
      sessions: {
        's-old': { protocolUID: 'p-old', caseId: 'old case' },
        's-new': { protocolUID: 'p-new' },
      },
      deviceSettings: { description: 'Field iPad 3', interfaceScale: 120 },
      dismissedUpdates: ['6.5.3', '6.6.2'],
      activeSessionId: null,
      router: { location: { pathname: '/' } },
      _persist: { version: -1, rehydrated: true },
    });
  });
});

describe('moveLegacyIosProtocols', () => {
  it('moves each legacy protocol directory into Directory.Data', async () => {
    const filesystem = memoryFilesystem([
      'LIBRARY:NoCloud/protocols',
      'LIBRARY:NoCloud/protocols/p-old',
      'LIBRARY:NoCloud/protocols/p-other',
      'LIBRARY:NoCloud/protocols/stray.txt',
    ]);

    expect(await moveLegacyIosProtocols(filesystem)).toEqual({
      moved: ['p-old', 'p-other'],
      skipped: [],
    });
    expect(filesystem.existing).toEqual(
      new Set([
        'LIBRARY:NoCloud/protocols',
        'LIBRARY:NoCloud/protocols/stray.txt',
        'DATA:protocols',
        'DATA:protocols/p-old',
        'DATA:protocols/p-other',
      ]),
    );
  });

  it('leaves a protocol already at the destination in place', async () => {
    const filesystem = memoryFilesystem([
      'LIBRARY:NoCloud/protocols',
      'LIBRARY:NoCloud/protocols/p-old',
      'DATA:protocols',
      'DATA:protocols/p-old',
    ]);

    expect(await moveLegacyIosProtocols(filesystem)).toEqual({
      moved: [],
      skipped: ['p-old'],
    });
    expect(filesystem.rename).not.toHaveBeenCalled();
  });

  it('does nothing when the Cordova build left no protocols', async () => {
    const filesystem = memoryFilesystem([]);

    expect(await moveLegacyIosProtocols(filesystem)).toEqual({
      moved: [],
      skipped: [],
    });
    expect(filesystem.mkdir).not.toHaveBeenCalled();
  });
});

describe('migrateLegacyCordovaData', () => {
  const now = () => '2026-10-13T12:00:00.000Z';
  let filesystem;

  beforeEach(() => {
    filesystem = memoryFilesystem([
      'LIBRARY:NoCloud/protocols',
      'LIBRARY:NoCloud/protocols/p-old',
    ]);
  });

  it('migrates the legacy store and protocol files on iOS, then records the flag', async () => {
    const storage = memoryStorage();
    const legacyData = {
      readState: vi.fn(async () => ({ exists: true, value: legacyRaw })),
    };

    const flag = await migrateLegacyCordovaData({
      storage,
      platform: 'ios',
      legacyData,
      filesystem,
      now,
    });

    expect(legacyData.readState).toHaveBeenCalledWith({ key: PERSIST_KEY });
    expect(storage.values.get(PERSIST_KEY)).toBe(legacyRaw);
    expect(filesystem.existing.has('DATA:protocols/p-old')).toBe(true);
    expect(flag).toEqual({
      version: 1,
      completedAt: '2026-10-13T12:00:00.000Z',
      outcome: 'migrated',
      protocols: 1,
      sessions: 1,
      protocolDirectoriesMoved: 1,
      protocolDirectoriesSkipped: 0,
    });
    expect(storage.values.get(MIGRATION_FLAG_KEY)).toEqual(flag);
  });

  it('leaves protocol files alone on Android, where they are already in place', async () => {
    const storage = memoryStorage();

    await migrateLegacyCordovaData({
      storage,
      platform: 'android',
      legacyData: {
        readState: async () => ({ exists: true, value: legacyRaw }),
      },
      filesystem,
      now,
    });

    expect(storage.values.get(PERSIST_KEY)).toBe(legacyRaw);
    expect(filesystem.rename).not.toHaveBeenCalled();
  });

  it('merges into a store the new build has already written', async () => {
    const currentRaw = persisted({
      installedProtocols: { 'p-new': { name: 'New protocol' } },
      sessions: {},
    });
    const storage = memoryStorage({ [PERSIST_KEY]: currentRaw });

    await migrateLegacyCordovaData({
      storage,
      platform: 'ios',
      legacyData: {
        readState: async () => ({ exists: true, value: legacyRaw }),
      },
      filesystem,
      now,
    });

    expect(
      Object.keys(read(storage.values.get(PERSIST_KEY)).installedProtocols),
    ).toEqual(['p-old', 'p-new']);
  });

  it('does not run again once the flag is set', async () => {
    const existingFlag = { version: 1, outcome: 'migrated' };
    const storage = memoryStorage({ [MIGRATION_FLAG_KEY]: existingFlag });
    const legacyData = { readState: vi.fn() };

    expect(
      await migrateLegacyCordovaData({
        storage,
        platform: 'ios',
        legacyData,
        filesystem,
        now,
      }),
    ).toBe(existingFlag);
    expect(legacyData.readState).not.toHaveBeenCalled();
    expect(storage.setItem).not.toHaveBeenCalled();
  });

  it('records the flag without changing the store when there is no legacy database', async () => {
    const storage = memoryStorage();

    const flag = await migrateLegacyCordovaData({
      storage,
      platform: 'ios',
      legacyData: { readState: async () => ({ exists: false }) },
      filesystem,
      now,
    });

    expect(flag).toEqual({
      version: 1,
      completedAt: '2026-10-13T12:00:00.000Z',
      outcome: 'no-legacy-store',
    });
    expect(storage.values.has(PERSIST_KEY)).toBe(false);
    expect(filesystem.rename).not.toHaveBeenCalled();
  });

  it('records the flag when the legacy database holds no store', async () => {
    const storage = memoryStorage();

    const flag = await migrateLegacyCordovaData({
      storage,
      platform: 'android',
      legacyData: { readState: async () => ({ exists: true, value: null }) },
      filesystem,
      now,
    });

    expect(flag.outcome).toBe('legacy-store-empty');
  });

  it('leaves the flag unset and files unmoved when the legacy store is unreadable', async () => {
    const storage = memoryStorage();

    await expect(
      migrateLegacyCordovaData({
        storage,
        platform: 'ios',
        legacyData: {
          readState: async () => ({ exists: true, value: '{"sessions":' }),
        },
        filesystem,
        now,
      }),
    ).rejects.toThrow(SyntaxError);

    expect(storage.values.has(MIGRATION_FLAG_KEY)).toBe(false);
    expect(filesystem.rename).not.toHaveBeenCalled();
  });

  it('leaves the flag unset when the filesystem fails for a reason other than a missing path', async () => {
    const storage = memoryStorage();
    filesystem.stat = vi.fn(async () => {
      throw Object.assign(new Error('bridge unavailable'), {
        code: 'OS-PLUG-FILE-0013',
      });
    });

    await expect(
      migrateLegacyCordovaData({
        storage,
        platform: 'ios',
        legacyData: {
          readState: async () => ({ exists: true, value: legacyRaw }),
        },
        filesystem,
        now,
      }),
    ).rejects.toThrow('bridge unavailable');

    expect(storage.values.has(MIGRATION_FLAG_KEY)).toBe(false);
    expect(storage.values.has(PERSIST_KEY)).toBe(false);
  });

  it('leaves the flag unset when the native read fails, so the next launch retries', async () => {
    const storage = memoryStorage();

    await expect(
      migrateLegacyCordovaData({
        storage,
        platform: 'ios',
        legacyData: {
          readState: async () => {
            throw new Error('Could not open the legacy database');
          },
        },
        filesystem,
        now,
      }),
    ).rejects.toThrow('Could not open the legacy database');

    expect(storage.values.has(MIGRATION_FLAG_KEY)).toBe(false);
  });
});

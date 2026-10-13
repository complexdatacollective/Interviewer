import { beforeEach, describe, expect, it, vi } from 'vitest';

const store = new Map();
vi.mock('localforage', () => ({
  default: {
    config: vi.fn(),
    getItem: vi.fn((k) => Promise.resolve(store.has(k) ? store.get(k) : null)),
    setItem: vi.fn((k, v) => {
      store.set(k, v);
      return Promise.resolve(v);
    }),
    removeItem: vi.fn((k) => {
      store.delete(k);
      return Promise.resolve();
    }),
  },
}));

const migration = vi.hoisted(() => ({ run: vi.fn() }));
vi.mock('../legacyCordovaMigration', () => ({
  migrateLegacyCordovaData: migration.run,
}));

import { localforageStorageEngine } from '../storageAdapters';

const deferred = () => {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};

describe('localforageStorageEngine', () => {
  beforeEach(() => {
    store.clear();
    migration.run.mockReset();
    migration.run.mockResolvedValue({ outcome: 'no-legacy-store' });
  });

  it('starts persistence only after the Cordova data migration', async () => {
    const run = deferred();
    migration.run.mockReturnValue(run.promise);
    const onPersistReady = vi.fn();

    localforageStorageEngine(onPersistReady);
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(onPersistReady).not.toHaveBeenCalled();

    run.resolve({ outcome: 'migrated' });
    await vi.waitFor(() => expect(onPersistReady).toHaveBeenCalledTimes(1));
  });

  it('still starts persistence when the migration fails', async () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    migration.run.mockRejectedValue(new Error('unreadable'));
    const onPersistReady = vi.fn();

    localforageStorageEngine(onPersistReady);

    await vi.waitFor(() => expect(onPersistReady).toHaveBeenCalledTimes(1));
    expect(consoleError).toHaveBeenCalled();
    consoleError.mockRestore();
  });

  it('round-trips values', async () => {
    const engine = localforageStorageEngine(vi.fn());

    await engine.setItem('k', 'v');
    expect(await engine.getItem('k')).toBe('v');
    await engine.removeItem('k');
    expect(await engine.getItem('k')).toBeNull();
  });
});

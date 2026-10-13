import { registerPlugin } from '@capacitor/core';
import { Directory, Filesystem } from '@capacitor/filesystem';

/**
 * One-time migration of the data the Cordova builds of Interviewer (6.5.x and
 * earlier) left on iPads and Android tablets.
 *
 * The Cordova builds persisted the redux store in a cordova-sqlite-storage
 * database and kept protocol files in cordova.file.dataDirectory. The
 * Capacitor builds persist the store in IndexedDB (localforage) and keep
 * protocol files in Directory.Data, so an in-place upgrade found neither:
 *
 *   store:     SQLite `redux-store-db`, table `redux_store`
 *              iOS: Library/LocalDatabase/   Android: databases/
 *              → localforage `networkCanvas6/redux_store`
 *   protocols: iOS: Library/NoCloud/protocols → Documents/protocols
 *              Android: files/protocols, which already is Directory.Data
 *
 * The native LegacyCordovaData plugin (ios/App/App, android/app/src/main/java)
 * reads the old store. This module merges it into the new one, moves the iOS
 * protocol files, then records MIGRATION_FLAG_KEY in the new store so it never
 * runs again. The old database is left untouched as a fallback.
 */

export const PERSIST_KEY = 'persist:networkCanvas6';
export const MIGRATION_FLAG_KEY = 'legacyCordovaMigration';
const MIGRATION_VERSION = 1;

// iOS: cordova.file.dataDirectory with iosPersistentFileLocation=Library.
const LEGACY_IOS_PROTOCOLS_PATH = 'NoCloud/protocols';
const PROTOCOLS_PATH = 'protocols';

const LegacyCordovaData = registerPlugin('LegacyCordovaData');

// redux-persist stores one JSON string whose values are each slice, itself
// serialised as a JSON string.
const parsePersisted = (raw) =>
  Object.fromEntries(
    Object.entries(JSON.parse(raw)).map(([key, value]) => [
      key,
      JSON.parse(value),
    ]),
  );

const serializePersisted = (slices) =>
  JSON.stringify(
    Object.fromEntries(
      Object.entries(slices).map(([key, value]) => [
        key,
        JSON.stringify(value),
      ]),
    ),
  );

/**
 * Merge the Cordova build's persisted store into one the Capacitor build has
 * already written (it writes on first launch, and the user may have imported
 * protocols or run interviews since upgrading).
 *
 * - Protocols and sessions are keyed by UUID, so both sets are kept.
 * - Device settings come from the old build: the new build's are its defaults
 *   unless the user changed them in the few days since upgrading.
 * - Dismissed update notices are combined.
 * - Navigation state (router, search, activeSessionId, _persist) is the new
 *   build's.
 */
export const mergePersistedState = (legacyRaw, currentRaw) => {
  if (!currentRaw) return legacyRaw;

  const legacy = parsePersisted(legacyRaw);
  const current = parsePersisted(currentRaw);

  return serializePersisted({
    ...legacy,
    ...current,
    installedProtocols: {
      ...legacy.installedProtocols,
      ...current.installedProtocols,
    },
    sessions: { ...legacy.sessions, ...current.sessions },
    deviceSettings: { ...current.deviceSettings, ...legacy.deviceSettings },
    dismissedUpdates: [
      ...new Set([
        ...(legacy.dismissedUpdates ?? []),
        ...(current.dismissedUpdates ?? []),
      ]),
    ],
  });
};

// @capacitor/filesystem's "does not exist" error on iOS and Android.
const FILE_NOT_FOUND = 'OS-PLUG-FILE-0008';

// Only a missing path counts as absent: any other failure propagates, so the
// run stops before recording the flag and the next launch retries it.
const pathExists = (filesystem, path, directory) =>
  filesystem.stat({ path, directory }).then(
    () => true,
    (error) => {
      if (error?.code === FILE_NOT_FOUND) return false;
      throw error;
    },
  );

/**
 * Move each protocol directory the iOS Cordova build installed into the
 * directory the Capacitor build reads. A protocol already present at the
 * destination (an earlier, interrupted run) is left alone.
 */
export const moveLegacyIosProtocols = async (filesystem) => {
  if (
    !(await pathExists(
      filesystem,
      LEGACY_IOS_PROTOCOLS_PATH,
      Directory.Library,
    ))
  ) {
    return { moved: [], skipped: [] };
  }

  const { files } = await filesystem.readdir({
    path: LEGACY_IOS_PROTOCOLS_PATH,
    directory: Directory.Library,
  });

  if (!(await pathExists(filesystem, PROTOCOLS_PATH, Directory.Data))) {
    await filesystem.mkdir({
      path: PROTOCOLS_PATH,
      directory: Directory.Data,
      recursive: true,
    });
  }

  const moved = [];
  const skipped = [];

  for (const { name, type } of files) {
    if (type !== 'directory') continue;

    const to = `${PROTOCOLS_PATH}/${name}`;
    if (await pathExists(filesystem, to, Directory.Data)) {
      skipped.push(name);
      continue;
    }

    await filesystem.rename({
      from: `${LEGACY_IOS_PROTOCOLS_PATH}/${name}`,
      directory: Directory.Library,
      to,
      toDirectory: Directory.Data,
    });
    moved.push(name);
  }

  return { moved, skipped };
};

const countKeys = (raw, slice) => {
  try {
    return Object.keys(JSON.parse(JSON.parse(raw)[slice] ?? '{}')).length;
  } catch {
    return 0;
  }
};

/**
 * Run the migration unless MIGRATION_FLAG_KEY says it already has. Throws if
 * it could not finish, leaving the flag unset so the next launch retries.
 */
export const migrateLegacyCordovaData = async ({
  storage,
  platform,
  legacyData = LegacyCordovaData,
  filesystem = Filesystem,
  now = () => new Date().toISOString(),
}) => {
  const existingFlag = await storage.getItem(MIGRATION_FLAG_KEY);
  if (existingFlag) return existingFlag;

  const { exists, value: legacyRaw } = await legacyData.readState({
    key: PERSIST_KEY,
  });

  if (!legacyRaw) {
    const flag = {
      version: MIGRATION_VERSION,
      completedAt: now(),
      outcome: exists ? 'legacy-store-empty' : 'no-legacy-store',
    };
    await storage.setItem(MIGRATION_FLAG_KEY, flag);
    return flag;
  }

  // Parse before touching anything, so a corrupt legacy store fails the run
  // without moving files.
  parsePersisted(legacyRaw);

  const protocolFiles =
    platform === 'ios'
      ? await moveLegacyIosProtocols(filesystem)
      : { moved: [], skipped: [] };

  const currentRaw = await storage.getItem(PERSIST_KEY);
  await storage.setItem(
    PERSIST_KEY,
    mergePersistedState(legacyRaw, currentRaw),
  );

  const flag = {
    version: MIGRATION_VERSION,
    completedAt: now(),
    outcome: 'migrated',
    protocols: countKeys(legacyRaw, 'installedProtocols'),
    sessions: countKeys(legacyRaw, 'sessions'),
    protocolDirectoriesMoved: protocolFiles.moved.length,
    protocolDirectoriesSkipped: protocolFiles.skipped.length,
  };
  await storage.setItem(MIGRATION_FLAG_KEY, flag);
  return flag;
};

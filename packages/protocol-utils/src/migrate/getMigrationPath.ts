import migrations from './migrations/index.js';
import { MigrationNotPossibleError, VersionMismatchError, StringVersionError } from './errors.js';

const isMigrationPathValid = path =>
  !path.some(({ migration }) => !migration);

const matchMigrations = (sourceVersion, targetVersion) =>
  ({ version }) =>
    version > sourceVersion && version <= targetVersion;

const getMigrationPath = (rawSourceSchemaVersion, targetSchemaVersion) => {
  if (!Number.isInteger(targetSchemaVersion)) {
    throw new StringVersionError(targetSchemaVersion, 'target');
  }

  // This is a shim for the original schema which used the format "1.0.0"
  const sourceSchemaVersion = rawSourceSchemaVersion === '1.0.0' ? 1 : rawSourceSchemaVersion;

  // In case string version numbers are accidentally reintroduced.
  if (!Number.isInteger(sourceSchemaVersion)) {
    throw new StringVersionError(sourceSchemaVersion, 'source');
  }

  if (sourceSchemaVersion >= targetSchemaVersion) {
    throw new VersionMismatchError(sourceSchemaVersion, targetSchemaVersion);
  }

  // Get migration steps between versions
  const migrationPath = migrations.filter(
    matchMigrations(sourceSchemaVersion, targetSchemaVersion),
  );

  if (!isMigrationPathValid(migrationPath)) {
    throw new MigrationNotPossibleError(sourceSchemaVersion, targetSchemaVersion);
  }

  return migrationPath;
};

export default getMigrationPath;

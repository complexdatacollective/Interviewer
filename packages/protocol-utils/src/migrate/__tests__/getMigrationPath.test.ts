/* eslint-env jest */

const getMigrationPath = require('../getMigrationPath');

/**
 * Migrations are run in the order that they are defined relative to one another
 * e.g. 1 -> 3, will run 1 -> 2 -> 3
 */

// const

// const isMigrationPathValid = path =>
//   !path.some(({ migration }) => !migration);

// const matchMigrations = (sourceVersion, targetVersion) =>
//   ({ version }) =>
//     version > sourceVersion && version <= targetVersion;

// const getMigrationPath = (sourceSchemaVersion, targetSchemaVersion) => {
//   if (sourceSchemaVersion >= targetSchemaVersion) {
//     throw new VersionMismatchError(sourceSchemaVersion, targetSchemaVersion);
//   }

//   // Get migration steps between versions
//   const migrationPath = migrations.filter(
//     matchMigrations(sourceSchemaVersion, targetSchemaVersion),
//   );

//   if (!isMigrationPathValid(migrationPath)) {
//     throw new MigrationNotPossibleError(sourceSchemaVersion, targetSchemaVersion);
//   }

//   return migrationPath;
// };

describe('migrateProtocol', () => {
  it('gets the correct migration path for a protocol', () => {
    const migrationPath = getMigrationPath(1, 4);

    expect(migrationPath.length).toBe(3);

    expect(migrationPath).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ version: 2 }),
        expect.objectContaining({ version: 3 }),
        expect.objectContaining({ version: 4 }),
      ]),
    );
  });
});

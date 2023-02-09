const getMigrationPath = require('./getMigrationPath');
const MigrationStepError = require('./errors').MigrationStepError;

const migrateStep = (protocol, { version, migration }) => {
  try {
    return migration(protocol);
  } catch (e) {
    throw new MigrationStepError(version, e);
  }
};

const migrateProtocol = (protocol, targetSchemaVersion) => {
  // Get migration steps between versions
  const migrationPath = getMigrationPath(protocol.schemaVersion, targetSchemaVersion);

  // Perform migration
  const updatedProtocol = migrationPath.reduce(migrateStep, protocol);

  const resultProtocol = {
    ...updatedProtocol,
    schemaVersion: targetSchemaVersion,
  };

  const { migrations } = migrationPath
    .reduce(
      (acc, { version }) => {
        return {
          previous: version,
          migrations: [...acc.migrations, [acc.previous, version]],
        };
      },
      { previous: protocol.schemaVersion, migrations: [] },
    );

  return [
    resultProtocol,
    migrations,
  ];
};

module.exports = migrateProtocol;

const getMigrationPath = require('./getMigrationPath');

const canUpgrade = (sourceSchemaVersion, targetSchemaVersion) => {
  try {
    getMigrationPath(sourceSchemaVersion, targetSchemaVersion);
  } catch (e) {
    return false;
  }

  return true;
};

module.exports = canUpgrade;

const getMigrationPath = require('./getMigrationPath');

const getMigrationNotes = (sourceSchemaVersion, targetSchemaVersion) => {
  try {
    const migrationPath = getMigrationPath(sourceSchemaVersion, targetSchemaVersion);
    const notes = migrationPath.reduce((acc, migration) => {
      if (!migration.notes) { return acc; }
      return [...acc, { notes: migration.notes, version: migration.version }];
    }, []);
    return notes;
  } catch (e) {
    return undefined;
  }
};

module.exports = getMigrationNotes;

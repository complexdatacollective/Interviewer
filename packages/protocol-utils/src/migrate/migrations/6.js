/**
 * Migration from v5 to v6
 */

const migrateStages = (stages = []) => stages.map(stage => {

  if (stage.type !== 'NameGeneratorAutoComplete' && stage.type !== 'NameGeneratorList') {
    return stage;
  }

  return {
    ...stage,
    type: 'NameGeneratorRoster',
  }
});

const migration = (protocol) => {
  return {
    ...protocol,
    stages: migrateStages(protocol.stages),
  }
}

// Markdown format
const notes = `
- Replace roster-based name generators (small and large) with a single new interface that combines the functionality of both. This will change the interview experience, and may impact your data collection!
- Enable support for using the automatic node positioning feature on the Sociogram interface.
`;

const v6 = {
  version: 6,
  notes,
  migration,
};

module.exports = v6;

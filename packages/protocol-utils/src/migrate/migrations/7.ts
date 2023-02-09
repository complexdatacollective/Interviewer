/**
 * Migration from v6 to v7
 */

const migration = (protocol) => protocol;

// Markdown format
const notes = `
- Add the ability to specify minimum and maximum numbers of named alters on name generator stages.
- Add additional skip logic options for handling ordinal and categorical variables.
`;

const v7 = {
  version: 7,
  notes,
  migration,
};

export default v7;

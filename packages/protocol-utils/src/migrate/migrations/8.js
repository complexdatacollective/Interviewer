/**
 * Migration from v7 to v8
 */

const migration = (protocol) => protocol;

// Markdown format
const notes = `
- Add new validation options for form fields: \`greaterThanVariable\` and \`lessThanVariable\`.
- Add new comparator options for skip logic and filter: \`contains\` and \`does not contain\`.
- Amplify comparator options \`includes\` and \`excludes\` for ordinal and categorical variables to allow multiple selections.
`;

const v8 = {
  version: 8,
  notes,
  migration,
};

export default v8;

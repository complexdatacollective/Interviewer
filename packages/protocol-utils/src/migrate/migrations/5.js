/**
 * Migration from v4 to v5
 */

const migration = (protocol) => protocol;

// Markdown format
const notes = `
- Enable the 'Tie Strength Census' interface, which will allow you to conduct a dyad census that also captures the strength of the tie and assigns it to an ordinal variable.
- Add new validation options for form fields: \`unique\`, \`sameAs\`, and \`differentFrom\`.
- Enable an 'Interview Script' section for each stage, where notes for the interviewer can be added. 
`;

const v5 = {
  version: 5,
  notes,
  migration,
};

export default v5;

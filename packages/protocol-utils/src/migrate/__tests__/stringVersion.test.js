/* eslint-env jest */

const migrateProtocol = require('../migrateProtocol');

const v1Protocol = {
  schemaVersion: '1.0.0',
  codebook: {
    node: {
      disallowedType: {
        name: 'disallowed type name',
        variables: {
          invalidExampleVariable: {
            name: 'variable (with) disallowed characters!',
          },
          invalidExampleVariableDuplicate: {
            // should resolve to the same as previous, therefore needs incrementing
            name: 'variable (with) disallowed characters?',
          },
        },
      },
    },
  },
};

describe('string version handling', () => {
  it('migrates version "1.0.0" correctly', () => {
    const [result] = migrateProtocol(v1Protocol, 4);

    expect(result).toMatchSnapshot();
  });

  it('throws an error for other source string version numbers', () => {
    expect(() => {
      migrateProtocol({
        ...v1Protocol,
        schemaVersion: '2.0.0',
      }, 4);
    }).toThrow('The source schema version is not recognised, must be an integer ("2.0.0").');
  });

  it('throws an error for target string version numbers', () => {
    expect(() => {
      migrateProtocol(v1Protocol, '4.0.0');
    }).toThrow('The target schema version is not recognised, must be an integer ("4.0.0").');
  });
});

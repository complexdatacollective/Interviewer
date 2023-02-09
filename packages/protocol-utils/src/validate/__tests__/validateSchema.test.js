/* eslint-env jest */

const validateSchema = require('../validateSchema');
const schemas = require('../../schemas');

jest.mock('../../schemas');

const validator_1 = jest.fn(() => ([]));
const validator_2 = jest.fn(() => ([]));

schemas.push({ version: 1, validator: validator_1 });
schemas.push({ version: 2, validator: validator_2 });

const getProtocol = mergeProps => ({
  schemaVersion: 1,
  ...mergeProps,
});

describe('validateSchema', () => {
  beforeEach(() => {
    validator_1.mockReset();
    validator_2.mockReset();
  });

  it('ensures protocol schema is defined', () => {
    const expectedError = new Error("Provided schema version '-99' is not defined");

    expect(validateSchema(getProtocol({ schemaVersion: -99 })))
      .toEqual([expectedError]);
  });

  it('it validates against schema version defined in protocol', () => {
    validateSchema(getProtocol({ schemaVersion: 1 }));
    expect(validator_1.mock.calls).toEqual([[{ 'schemaVersion': 1 }, 'Protocol']]);
  });

  it('it validates against specified schema version', () => {
    validateSchema(getProtocol({ schemaVersion: 1 }), 2);
    expect(validator_2.mock.calls).toEqual([[{ 'schemaVersion': 1 }, 'Protocol']]);
  });

  it('schemas versions are always interpreted as integers', () => {
    validateSchema(getProtocol({ schemaVersion: '1.0.0' }));
    expect(validator_1.mock.calls).toEqual([[{ 'schemaVersion': '1.0.0' }, 'Protocol']]);
    validateSchema(getProtocol({ schemaVersion: '1' }), '2');
    expect(validator_2.mock.calls).toEqual([[{ 'schemaVersion': '1' }, 'Protocol']]);
  });
});

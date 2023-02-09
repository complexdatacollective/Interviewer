/* eslint-env jest */

const checkSupport = require('../checkSupport');

const getProtocol = mergeProps => ({
  schemaVersion: 1,
  ...mergeProps,
});

describe('checkSupport', () => {
  it('ensures protocol schema matches specified versions', () => {
    const expectedError = new Error('Protocol schema version "2" does not match any supported by application: ["1"]');

    expect(checkSupport(getProtocol({ schemaVersion: '1' }), ['1', '2', '3'])).toEqual(true);
    expect(() => {
      checkSupport(getProtocol({ schemaVersion: '2' }), ['1'])
    }).toThrow(expectedError);
  });
});

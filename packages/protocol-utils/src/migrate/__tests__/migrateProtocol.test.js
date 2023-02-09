/* eslint-env jest */

const migrateProtocol = require('../migrateProtocol');
const migrations = require('../migrations');

jest.mock('../migrations');

/**
 * Migrations are run in the order that they are defined relative to one another
 * e.g. 1 -> 3, will run 1 -> 2 -> 3
 */

const specificMigrationError = new Error('whoops');
migrations.push({ version: 1, migration: jest.fn(protocol => protocol) });
migrations.push({ version: 2, migration: jest.fn(protocol => ({ ...protocol, foo: 'bar', bazz: 'buzz' })) });
migrations.push({ version: 3, migration: jest.fn(({ foo, ...protocol }) => ({ ...protocol, fizz: 'pop' })) });
migrations.push({ version: 4, migration: null });
migrations.push({ version: 5, migration: jest.fn(protocol => protocol) });
migrations.push({ version: 6, migration: jest.fn(() => { throw specificMigrationError; }) });

const mockProtocol = {
  schemaVersion: 1,
};

describe('migrateProtocol', () => {
  beforeEach(() => {
    // reset mocks
    migrations.forEach(({ migration }) => migration && migration.mockClear());
  });

  it('runs migrations from protocol schema version to target schema version', () => {
    migrateProtocol(mockProtocol, 2);

    expect(migrations[0].migration.mock.calls.length).toBe(0); // version: '1'
    expect(migrations[1].migration.mock.calls.length).toBe(1); // version: '2'
    expect(migrations[2].migration.mock.calls.length).toBe(0); // version: '3'
  });

  it('migrations transform protocol successively', () => {
    const [resultProtocol] = migrateProtocol(mockProtocol, 3);

    expect(resultProtocol).toEqual({ bazz: 'buzz', fizz: 'pop', schemaVersion: 3 });
  });

  it('will migrate when there are no steps', () => {
    const [newProtocol] = migrateProtocol({
      schemaVersion: 99,
    }, 999);

    expect(newProtocol).toEqual({
      schemaVersion: 999,
    });
  });

  it('throws an error if we try to migrate downwards', () => {
    expect(() => {
      migrateProtocol({
        schemaVersion: 3,
      }, 1);
    }).toThrow('Nonsensical migration path (3 -> 1).');
  });

  it('throws an error if we try to migrate to existing version', () => {
    expect(() => {
      migrateProtocol({
        schemaVersion: 1,
      }, 1);
    }).toThrow('Nonsensical migration path (1 -> 1).');
  });

  it('throws an error migration run on a blocking migration path (`migration: null`)', () => {
    expect(() => {
      migrateProtocol(mockProtocol, 4);
    }).toThrow('Migration to this version is not possible (1 -> 4).');
  });

  it('throws a generic MigrationError error migration step throws an error', () => {
    expect(() => {
      migrateProtocol({
        schemaVersion: 5,
      }, 6);
    }).toThrow('Migration step failed (6)');
  });
});

/* eslint-env jest */

const mockHandlers = {};

const autoUpdater = {
  simulate: (name, ...args) => mockHandlers[name] && mockHandlers[name](...args),
  checkForUpdatesAndNotify: jest.fn(),
  checkForUpdates: jest.fn().mockResolvedValue({}),
  on: jest.fn((name, cb) => { mockHandlers[name] = cb; }),
};

module.exports = { autoUpdater };

/* eslint-env jest */

const dialog = {
  showMessageBox: jest.fn().mockImplementation(() => Promise.resolve('response')),
  showOpenDialog: jest.fn().mockImplementation(() => Promise.resolve('response')),
};

const app = {
  getVersion: jest.fn(() => '0.0.0'),
  getPath: jest.fn(() => '/dev/null/get/electron/path'),
};

module.exports = {
  app,
  dialog,
};

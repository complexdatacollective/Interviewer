/* eslint-env jest */

module.exports = {
  transports: {
    console: {
    },
    file: {
    },
  },
  debug: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
};

/* eslint-disable import/prefer-default-export, no-console */
/* eslint-env jest */

const readFile = jest.fn(console.log);
const ensurePathExists = jest.fn(console.log);
const writeStream = jest.fn(console.log);
const userDataPath = jest.fn(() => 'tmp/mock/user/path');

export {
  readFile,
  ensurePathExists,
  writeStream,
  userDataPath,
};

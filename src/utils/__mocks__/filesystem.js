/* eslint-disable import/prefer-default-export, no-console */
/* eslint-disable @codaco/spellcheck/spell-checker */
/* eslint-env jest */

const readFile = jest.fn(console.log);
const writeFile = jest.fn(() => Promise.resolve());
const ensurePathExists = jest.fn(console.log);
const writeStream = jest.fn(console.log);
const userDataPath = jest.fn(() => 'tmp/mock/user/path/');

const resolveFileSystemUrl = jest.fn(() => Promise.resolve({
  isFile: true,
  name: 'mockFileSystemUrl',
  fullPath: 'file:///mockFileSystemUrl/mock/url',
  toURL: () => 'http://localhost/mock/url',
}));

const tempDataPath = jest.fn(() => 'tmp/mock/temp/path');

export {
  readFile,
  writeFile,
  ensurePathExists,
  resolveFileSystemUrl,
  writeStream,
  userDataPath,
  tempDataPath,
};

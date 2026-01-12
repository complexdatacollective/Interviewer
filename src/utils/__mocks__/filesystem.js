/* eslint-disable import/prefer-default-export, no-console */
/* eslint-disable @codaco/spellcheck/spell-checker */
import { vi } from 'vitest';

const readFile = vi.fn(console.log);
const writeFile = vi.fn(() => Promise.resolve());
const ensurePathExists = vi.fn(console.log);
const writeStream = vi.fn(console.log);
const userDataPath = vi.fn(() => 'tmp/mock/user/path/');

const resolveFileSystemUrl = vi.fn(() => Promise.resolve({
  isFile: true,
  name: 'mockFileSystemUrl',
  fullPath: 'file:///mockFileSystemUrl/mock/url',
  toURL: () => 'http://localhost/mock/url',
}));

const tempDataPath = vi.fn(() => 'tmp/mock/temp/path');

export {
  readFile,
  writeFile,
  ensurePathExists,
  resolveFileSystemUrl,
  writeStream,
  userDataPath,
  tempDataPath,
};

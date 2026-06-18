import { vi } from 'vitest';

const readFile = vi.fn(console.log);
const readDirectory = vi.fn(() => Promise.resolve([]));
const writeFile = vi.fn(() => Promise.resolve());
const ensurePathExists = vi.fn(console.log);
const userDataPath = vi.fn(() => 'tmp/mock/user/path/');

const resolveFileSystemUrl = vi.fn(() =>
  Promise.resolve({
    isFile: true,
    name: 'mockFileSystemUrl',
    fullPath: 'file:///mockFileSystemUrl/mock/url',
    toURL: () => 'http://localhost/mock/url',
  }),
);

const tempDataPath = vi.fn(() => 'tmp/mock/temp/path');

export {
  readFile,
  readDirectory,
  writeFile,
  ensurePathExists,
  resolveFileSystemUrl,
  userDataPath,
  tempDataPath,
};

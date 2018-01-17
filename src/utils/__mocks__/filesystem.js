/* eslint-disable import/prefer-default-export */
/* eslint-env jest */

const readFile = jest.fn(console.log);
const ensurePathExists = jest.fn(console.log);
const writeStream = jest.fn(console.log);

export {
  readFile,
  ensurePathExists,
  writeStream,
};

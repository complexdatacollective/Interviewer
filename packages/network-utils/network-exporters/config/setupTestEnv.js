// TODO: remove 'NODE_TLS_REJECT_UNAUTHORIZED=0' in the test script definition in package.json.
// Cert verification is disabled during tests for now to work around
// https://github.com/nodejs/node/issues/14736; fixed with Node 8.10.0.

const http = require('http');
const https = require('https');
const enzyme = require('enzyme');
const url = require('url');
const Writable = require('stream').Writable;

/**
 * @return {Stream.Writable} a writable stream, with an `asString()` method added for convenience
 */
const makeWriteableStream = () => {
  const chunks = [];

  const writable = new Writable({
    write(chunk, encoding, next) {
      chunks.push(chunk.toString());
      next(null);
    },
  });

  writable.asString = async () => new Promise((resolve, reject) => {
    writable.on('finish', () => { resolve(chunks.join('')); });
    writable.on('error', (err) => { reject(err); });
  });

  return writable;
};

const Helpers = {
  makeWriteableStream,

};

module.exports = Helpers;

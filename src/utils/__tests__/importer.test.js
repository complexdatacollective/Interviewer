/* eslint-env jest */

import process from 'process';
import path from 'path';
import fs from 'fs';
import environments from '../environments';
import { getEnvironment } from '../Environment';
import importer from '../importer';
import { readFile, writeStream, ensurePathExists } from '../filesystem';

jest.mock('../filesystem');
jest.mock('../protocol/protocolPath');

const protocolFilePath = path.join(process.cwd(), '__tests__', 'assets', 'demo.canvas');
const protocolFileData = fs.readFileSync(protocolFilePath);

readFile.mockReturnValue(Promise.resolve(protocolFileData));
writeStream.mockReturnValue(Promise.resolve());
ensurePathExists.mockReturnValue(Promise.resolve());

describe('importer', () => {
  describe('Electron', () => {
    beforeAll(() => {
      getEnvironment.mockReturnValue(environments.ELECTRON);
    });

    // it('copies the protocol files to the user data directory', (done) => {
    //   importer(protocolFilePath).then(() => {
    //     expect(ensurePathExists.mock.calls).toEqual([
    //       ['tmp/mock/path/protocols/demo.canvas'],
    //       ['tmp/mock/path/protocols/demo.canvas/assets/'],
    //     ]);
    //     expect(writeStream.mock.calls.map(([p]) => p)).toEqual([
    //       'tmp/mock/path/protocols/demo.canvas/custom.js',
    //       'tmp/mock/path/protocols/demo.canvas/protocol.json',

    //     ]);
    //     done();
    //   });
    // });
  });

  describe('Cordova', () => {
    beforeAll(() => {
      getEnvironment.mockReturnValue(environments.CORDOVA);
    });

    it('copies the protocol files to the user data directory');
  });
});

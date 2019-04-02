/* eslint-env jest */

import environments from '../../environments';
import { getEnvironment } from '../../Environment';
import { checkZipPaths } from '../extractProtocol';

const validZipPath = ['assets/example'];
const protocolPath = ['protocol.json'];
const doubleDotPath = ['assets/example..text'];
const traversingPath = ['../example'];
const traversingInnerPath = ['assets/../../example'];
const traversingWindowsPath = ['..\\example'];
const absolutePath = ['/example'];
const emptyPath = [''];
const mixedPaths = ['protocol.json', 'assets/example', '../example'];

const traversalError = /directory traversal not allowed/;
const absPathError = /absolute paths not allowed/;
const emptyPathError = /empty paths not allowed/;

describe('extractProtocol', () => {
  ([environments.CORDOVA, environments.ELECTRON]).forEach((platform) => {
    describe(`with platform ${platform.toString()}`, () => {
      beforeAll(() => {
        getEnvironment.mockReturnValue(platform);
      });

      it('allows valid assets', async () => {
        await expect(checkZipPaths(validZipPath)).resolves.toBe(undefined);
      });

      it('allows protocol.json', async () => {
        await expect(checkZipPaths(protocolPath)).resolves.toBe(undefined);
      });

      it('allows consecutive dots', async () => {
        await expect(checkZipPaths(doubleDotPath)).resolves.toBe(undefined);
      });

      it('rejects traversing paths', async () => {
        await expect(checkZipPaths(traversingPath)).rejects.toThrow(traversalError);
        await expect(checkZipPaths(traversingInnerPath)).rejects.toThrow(traversalError);
        // Technically only a problem on windows, but rejected outright anyway
        await expect(checkZipPaths(traversingWindowsPath)).rejects.toThrow(traversalError);
      });

      it('rejects absolute paths', async () => {
        await expect(checkZipPaths(absolutePath)).rejects.toThrow(absPathError);
      });

      it('rejects empty paths', async () => {
        await expect(checkZipPaths(emptyPath)).rejects.toThrow(emptyPathError);
      });

      it('rejects when any path is invalid', async () => {
        await expect(checkZipPaths(mixedPaths)).rejects.toThrow(traversalError);
      });
    });
  });
});

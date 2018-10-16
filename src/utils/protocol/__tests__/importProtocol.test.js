/* eslint-env jest */

import environments from '../../environments';
import { getEnvironment } from '../../Environment';
import { checkZipPaths } from '../importProtocol';

const validZipPath = ['assets/example'];
const protocolPath = ['protocol.json'];
const doubleDotPath = ['assets/example..text'];
const traversingPath = ['../example'];
const traversingInnerPath = ['assets/../../example'];
const traversingWindowsPath = ['..\\example'];
const absolutePath = ['/example'];
const emptyPath = [''];
const mixedPaths = ['protocol.json', 'assets/example', '../example'];

const traversalError = { message: /directory traversal not allowed/ };
const absPathError = { message: /absolute paths not allowed/ };
const emptyPathError = { message: /empty paths not allowed/ };

describe('importProtocol', () => {
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
        await expect(checkZipPaths(traversingPath)).rejects.toMatchObject(traversalError);
        await expect(checkZipPaths(traversingInnerPath)).rejects.toMatchObject(traversalError);
        // Technically only a problem on windows, but rejected outright anyway
        await expect(checkZipPaths(traversingWindowsPath)).rejects.toMatchObject(traversalError);
      });

      it('rejects absolute paths', async () => {
        await expect(checkZipPaths(absolutePath)).rejects.toMatchObject(absPathError);
      });

      it('rejects empty paths', async () => {
        await expect(checkZipPaths(emptyPath)).rejects.toMatchObject(emptyPathError);
      });

      it('rejects when any path is invalid', async () => {
        await expect(checkZipPaths(mixedPaths)).rejects.toMatchObject(traversalError);
      });
    });
  });
});

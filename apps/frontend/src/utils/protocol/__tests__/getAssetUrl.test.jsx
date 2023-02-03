/* eslint-env jest */

import environments from '../../environments';
import { getEnvironment } from '../../Environment';
import assetUrl from '../getAssetUrl';

jest.mock('../../filesystem');

describe('assetUrl', () => {
  describe('Cordova', () => {
    beforeAll(() => {
      getEnvironment.mockReturnValue(environments.CORDOVA);
    });

    it('Generates a relative asset path for a factory protocol', async () => {
      await expect(assetUrl('foo.canvas', 'bar.mp3', 'factory')).resolves.toEqual('tmp/mock/user/path/protocols/foo.canvas/assets/bar.mp3');
    });

    it('Generates a usable URL for a downloaded protocol', () => { }); // TBD how to handle [#681]
  });

  // describe('Electron', () => {
  //   beforeAll(() => {
  //     getEnvironment.mockReturnValue(environments.ELECTRON);
  //   });

  //   it('Generates an asset URL for the protocol', async () => {
  //     const encodedPath = encodeURIComponent(path.join('foo.canvas', 'assets', 'bar.mp3'));
  //     const expectedResult = `asset://${encodedPath}`;
  //     await expect(assetUrl('foo.canvas', 'bar.mp3')).resolves.toEqual(expectedResult);
  //   });

  //   describe('with missing parameters', () => {
  //     it('throws an error', () => {
  //       expect(() => assetUrl('foo.canvas')).toThrow();
  //       expect(() => assetUrl()).toThrow();
  //     });
  //   });
  // });
});

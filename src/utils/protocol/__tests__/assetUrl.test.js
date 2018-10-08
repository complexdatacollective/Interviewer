/* eslint-env jest */

import environments from '../../environments';
import { getEnvironment } from '../../Environment';
import assetUrl from '../assetUrl';

jest.mock('../../filesystem');

describe('assetUrl', () => {
  describe('Cordova', () => {
    beforeAll(() => {
      getEnvironment.mockReturnValue(environments.CORDOVA);
    });

    it('Generates a relative asset path for a factory protocol', async () => {
      await expect(assetUrl('foo.canvas', 'bar.mp3', 'factory')).resolves.toEqual('protocols/foo.canvas/assets/bar.mp3');
    });

    it.skip('Generates a usable URL for a downloaded protocol'); // TBD how to handle [#681]
  });

  describe('Electron', () => {
    beforeAll(() => {
      getEnvironment.mockReturnValue(environments.ELECTRON);
    });

    it('Generates an asset URL for the protocol', async () => {
      await expect(assetUrl('foo.canvas', 'bar.mp3')).resolves.toEqual('asset://foo.canvas/assets/bar.mp3');
    });

    describe('with missing parameters', () => {
      it('throws an error', () => {
        expect(() => assetUrl('foo.canvas')).toThrow();
        expect(() => assetUrl()).toThrow();
      });
    });
  });
});

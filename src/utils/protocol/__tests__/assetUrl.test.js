/* eslint-env jest */

import environments from '../../environments';
import { getEnvironment } from '../../Environment';
import assetUrl from '../assetUrl';

describe('assetUrl', () => {
  describe('Electron', () => {
    beforeAll(() => {
      getEnvironment.mockReturnValue(environments.ELECTRON);
    });

    it('Generates an asset URL for the protocol', () => {
      expect(assetUrl('foo.canvas', 'bar.mp3')).resolves.toEqual('asset://foo.canvas/assets/bar.mp3');
    });

    describe('with missing parameters', () => {
      it('throws an error', () => {
        expect(() => assetUrl('foo.canvas')).toThrow();
        expect(() => assetUrl()).toThrow();
      });
    });
  });
});

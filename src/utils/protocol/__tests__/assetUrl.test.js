/* eslint-env jest */

import assetUrl from '../assetUrl';

describe('assetUrl', () => {
  it('Generates an asset URL for the protocol', () => {
    expect(assetUrl('foo.canvas', 'bar.mp3')).toEqual('asset://foo.canvas/assets/bar.mp3');
  });

  describe('with missing parameters', () => {
    it('throws an error', () => {
      expect(() => assetUrl('foo.canvas')).toThrow();
      expect(() => assetUrl()).toThrow();
    });
  });
});

/* eslint-env jest */

import environments from '../../environments';
import { protocolPath } from '../protocolPath';

describe('protocolPath', () => {
  describe('Electron', () => {
    const subject = protocolPath(environments.ELECTRON);

    it('Generates an asset path for the file', () => {
      expect(
        subject('foo.canvas', 'protocol.json'),
      ).toEqual('/Users/Foo/Library/Application Support/Network Canvas/protocols/foo.canvas/protocol.json');

      expect(
        subject('foo.canvas'),
      ).toEqual('/Users/Foo/Library/Application Support/Network Canvas/protocols/foo.canvas/');
    });

    it('Thows an error if the protocol is not specified', () => {
      expect(() => subject()).toThrow();
    });
  });
});

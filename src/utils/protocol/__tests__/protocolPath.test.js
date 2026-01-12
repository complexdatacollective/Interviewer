/* eslint-disable @codaco/spellcheck/spell-checker */
import { vi } from 'vitest';

import path from 'path';
import environments from '../../environments';
import { getEnvironment } from '../../Environment';
import protocolPath from '../protocolPath';

vi.mock('../../filesystem');

describe('protocolPath', () => {
  describe('Electron', () => {
    beforeAll(() => {
      getEnvironment.mockReturnValue(environments.ELECTRON);
    });

    it('Generates an asset path for the file', () => {
      expect(
        protocolPath('foo.canvas', 'protocol.json'),
      ).toEqual(path.join('tmp', 'mock', 'user', 'path', 'protocols', 'foo.canvas', 'protocol.json'));

      expect(
        protocolPath('foo.canvas'),
      ).toEqual(path.join('tmp', 'mock', 'user', 'path', 'protocols', 'foo.canvas'));
    });

    it('Thows an error if the protocol is not specified', () => {
      expect(() => protocolPath()).toThrow();
    });
  });

  describe('Cordova', () => {
    beforeAll(() => {
      getEnvironment.mockReturnValue(environments.CORDOVA);
    });

    it('Generates an asset path for the file', () => {
      expect(
        protocolPath('foo.canvas', 'protocol.json'),
      ).toEqual('tmp/mock/user/path/protocols/foo.canvas/protocol.json');

      expect(
        protocolPath('foo.canvas'),
      ).toEqual('tmp/mock/user/path/protocols/foo.canvas/');
    });

    it('Thows an error if the protocol is not specified', () => {
      expect(() => protocolPath()).toThrow();
    });
  });
});

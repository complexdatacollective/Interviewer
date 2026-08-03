import path from 'node:path';

import { vi } from 'vitest';

import { getEnvironment } from '../../Environment';
import environments from '../../environments';
import protocolPath from '../protocolPath';

vi.mock('../../Environment');
vi.mock('../../filesystem');

describe('protocolPath', () => {
  describe('Electron', () => {
    beforeAll(() => {
      getEnvironment.mockReturnValue(environments.ELECTRON);
    });

    it('Generates an asset path for the file', async () => {
      await expect(
        protocolPath('foo.canvas', 'protocol.json'),
      ).resolves.toEqual(
        path.join(
          'tmp',
          'mock',
          'user',
          'path',
          'protocols',
          'foo.canvas',
          'protocol.json',
        ),
      );

      await expect(protocolPath('foo.canvas')).resolves.toEqual(
        path.join('tmp', 'mock', 'user', 'path', 'protocols', 'foo.canvas'),
      );
    });

    it('Thows an error if the protocol is not specified', async () => {
      await expect(protocolPath()).rejects.toThrow();
    });
  });

  describe('Capacitor', () => {
    beforeAll(() => {
      getEnvironment.mockReturnValue(environments.CAPACITOR);
    });

    it('Generates an asset path for the file', async () => {
      await expect(
        protocolPath('foo.canvas', 'protocol.json'),
      ).resolves.toEqual('protocols/foo.canvas/protocol.json');

      await expect(protocolPath('foo.canvas')).resolves.toEqual(
        'protocols/foo.canvas/',
      );
    });

    it('Thows an error if the protocol is not specified', async () => {
      await expect(protocolPath()).rejects.toThrow();
    });
  });
});

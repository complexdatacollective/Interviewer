import { beforeAll, describe, it, vi } from 'vitest';

import { getEnvironment } from '../Environment';
import environments from '../environments';

vi.mock('../Environment');
vi.mock('../filesystem');
vi.mock('../protocol/protocolPath');

describe('importer', () => {
  describe('Electron', () => {
    beforeAll(() => {
      getEnvironment.mockReturnValue(environments.ELECTRON);
    });

    it('copies the protocol files to the user data directory', () => {});
  });

  describe('Capacitor', () => {
    beforeAll(() => {
      getEnvironment.mockReturnValue(environments.CAPACITOR);
    });

    it('copies the protocol files to the user data directory', () => {});
  });
});

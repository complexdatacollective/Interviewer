/* eslint-disable @codaco/spellcheck/spell-checker */
import { vi, describe, it, beforeAll } from 'vitest';
import environments from '../environments';
import { getEnvironment } from '../Environment';

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

  describe('Cordova', () => {
    beforeAll(() => {
      getEnvironment.mockReturnValue(environments.CORDOVA);
    });

    it('copies the protocol files to the user data directory', () => {});
  });
});

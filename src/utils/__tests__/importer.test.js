/* eslint-env jest */
/* eslint-disable @codaco/spellcheck/spell-checker */

import environments from '../environments';
// eslint-disable-next-line import/named
import { getEnvironment } from '../Environment';

jest.mock('../filesystem');
jest.mock('../protocol/protocolPath');

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

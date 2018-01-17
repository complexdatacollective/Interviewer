/* eslint-env jest */

import environments from '../../environments';
import importer from '../importer';

describe('importer', () => {
  describe('Electron', () => {
    const subject = importer(environments.ELECTRON);
    it('copies the protocol files to the user data directory');
  });
});

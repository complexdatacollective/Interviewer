/* eslint-env jest */

import electron from 'electron';
import path from 'path';
import environments from '../../environments';
import { getEnvironment } from '../../Environment';
import downloadProtocol from '../downloadProtocol';

jest.mock('electron');
jest.mock('request-promise-native');
jest.mock('../../filesystem');

describe('downloadProtocol', () => {
  describe('Electron', () => {
    beforeAll(() => {
      getEnvironment.mockReturnValue(environments.ELECTRON);
    });

    it('returns a correct local path', () => {
      let localPath = path.join(electron.app.getPath(), '[a-zA-Z0-9-]+$');

      // separator gets lost in the regex for windows
      if (path.sep === '\\') {
        const replaceSep = new RegExp(/\\/, 'g');
        localPath = localPath.replace(replaceSep, '\\\\');
      }

      return expect(downloadProtocol('https://networkcanvas.com//foo bar.protocol')).resolves
        .toMatch(new RegExp(localPath));
    });
  });
});

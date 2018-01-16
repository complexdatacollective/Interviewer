/* eslint-env jest */

import environments from '../../environments';
import { getProtocol } from '../getProtocol';
import protocolPath from '../protocolPath';
import { readFile } from '../../filesystem';

jest.mock('../../filesystem');
jest.mock('../protocolPath');

describe('getProtocol', () => {
  describe('Electron', () => {
    const subject = getProtocol(environments.ELECTRON);

    it('returns the parsed protocol object', () => {
      expect(subject('bazz.protocol')).resolves.toEqual({
        foo: 'bar',
      });

      expect(protocolPath.mock.calls[0]).toEqual(['bazz.protocol', 'protocol.json']);
      expect(readFile.mock.calls[0]).toEqual(['tmp/fake/path/bazz.protocol/protocol.json', 'utf8']);
    });
  });
});

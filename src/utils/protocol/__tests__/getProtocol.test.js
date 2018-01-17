/* eslint-env jest */

import environments from '../../environments';
import { getEnvironment } from '../../Environment';
import getProtocol from '../getProtocol';
import protocolPath from '../protocolPath';
import { readFile } from '../../filesystem';

jest.mock('../../filesystem');
jest.mock('../protocolPath');

describe('getProtocol', () => {
  describe('Electron', () => {
    beforeAll(() => {
      getEnvironment.mockReturnValue(environments.ELECTRON);
      readFile.mockReturnValue(Promise.resolve('{ "foo": "bar" }'));
    });

    it('returns the parsed protocol object', () => {

      expect(getProtocol('bazz.protocol')).resolves.toEqual({
        foo: 'bar',
      });

      expect(protocolPath.mock.calls[0]).toEqual(['bazz.protocol', 'protocol.json']);
      expect(readFile.mock.calls[0]).toEqual(['tmp/fake/path/bazz.protocol/protocol.json', 'utf8']);
    });
  });
});

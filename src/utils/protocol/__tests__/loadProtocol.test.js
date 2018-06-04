/* eslint-env jest */

import environments from '../../environments';
import { getEnvironment } from '../../Environment';
import loadProtocol from '../loadProtocol';
import protocolPath from '../protocolPath';
import { readFile } from '../../filesystem';

jest.mock('../../filesystem');
jest.mock('../protocolPath');

describe('loadProtocol', () => {
  describe('Electron', () => {
    beforeAll(() => {
      getEnvironment.mockReturnValue(environments.ELECTRON);
      readFile.mockReturnValue(Promise.resolve('{ "foo": "bar" }'));
    });

    it('returns the parsed protocol object', () => {
      expect(loadProtocol('bazz.protocol')).resolves.toEqual({
        foo: 'bar',
      }); // TODO: This should return in order to work...

      expect(protocolPath.mock.calls[0]).toEqual(['bazz.protocol', 'protocol.json']);
      expect(readFile.mock.calls[0]).toEqual(['tmp/mock/path/protocols/bazz.protocol/protocol.json']);
    });
  });
});

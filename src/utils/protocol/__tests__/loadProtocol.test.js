/* eslint-env jest */

import environments from '../../environments';
import { getEnvironment } from '../../Environment';
import loadProtocol from '../loadProtocol';
import protocolPath from '../protocolPath';
import { readFile } from '../../filesystem';

jest.mock('../../filesystem');
jest.mock('../protocolPath');

const validProtocol = {
  name: 'bar',
  codebook: {},
  stages: [{ id: '1', type: 'Information', label: '', items: [] }],
};

describe('loadProtocol', () => {
  describe('Electron', () => {
    let mockProtocol;
    beforeAll(() => {
      mockProtocol = validProtocol;
      getEnvironment.mockReturnValue(environments.ELECTRON);
    });

    beforeEach(() => {
      readFile.mockReturnValue(Promise.resolve(JSON.stringify(mockProtocol)));
    });

    it('returns the parsed protocol object', async () => {
      await expect(loadProtocol('bazz.protocol')).resolves.toEqual(mockProtocol);
      expect(protocolPath.mock.calls[0]).toEqual(['bazz.protocol', 'protocol.json']);
      expect(readFile.mock.calls[0]).toEqual(['tmp/mock/path/protocols/bazz.protocol/protocol.json']);
    });

    describe('when protocol has no stages', () => {
      beforeAll(() => {
        mockProtocol = { ...validProtocol, stages: undefined };
      });

      it('rejects loading', async () => {
        await expect(loadProtocol('bazz.protocol')).rejects.toMatchObject({ message: 'Invalid protocol' });
      });
    });

    describe('when protocol has no codebook', () => {
      beforeAll(() => {
        mockProtocol = { ...validProtocol, codebook: undefined };
      });

      it('rejects loading', async () => {
        await expect(loadProtocol('bazz.protocol')).rejects.toMatchObject({ message: 'Invalid protocol' });
      });
    });
  });
});

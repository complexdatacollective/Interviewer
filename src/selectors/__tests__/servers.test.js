/* eslint-env jest */
import { getPairedServer } from '../servers';

const mockServer = { pairingServiceUrl: 'http://0.0.0.0' };

const mockState = {
  servers: {
    paired: [mockServer],
  },
};

describe('server selectors', () => {
  describe('getPairedServer', () => {
    it('can get the paired', () => {
      expect(getPairedServer(mockState)).toEqual(mockServer);
    });

    it('returns null if not found', () => {
      expect(getPairedServer({ servers: { paired: [] } })).toEqual(null);
    });
  });
});

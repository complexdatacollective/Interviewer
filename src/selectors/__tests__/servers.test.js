/* eslint-env jest */
import { getPairedServerFactory } from '../servers';

const apiUrl = 'http://0.0.0.0';
const mockServer = { apiUrl };

const mockState = {
  servers: {
    paired: [mockServer],
  },
};

describe('server selectors', () => {
  describe('getPairedServerFactory', () => {
    it('returns a function', () => {
      expect(getPairedServerFactory(mockState)).toBeInstanceOf(Function);
    });

    it('can get paired server by URL', () => {
      expect(getPairedServerFactory(mockState)(apiUrl)).toEqual(mockServer);
    });

    it('returns null if not found', () => {
      expect(getPairedServerFactory(mockState)('bad-url')).toEqual(null);
    });
  });
});

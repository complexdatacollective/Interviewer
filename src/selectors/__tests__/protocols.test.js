/* eslint-env jest */
import { protocolsByPath } from '../protocols';

const mockProtocols = [
  {
    name: 'a',
    path: 'aa-aa-aa',
  },
  {
    name: 'b',
    path: 'bb-bb-bb',
  },
];

const mockState = { protocols: mockProtocols };

describe('protocols selectors', () => {
  describe('protocolsByPath', () => {
    it('returns an object, keyed by path', () => {
      expect(protocolsByPath(mockState)['aa-aa-aa']).toEqual(mockProtocols[0]);
    });
  });
});

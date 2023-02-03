/* eslint-env jest */


import { getExternalData } from '../externalData';

const externalData = {
  baz: 'bar',
};

const mockState = {
  externalData,
};

const emptyState = {
  externalData: null,
};

describe('protocol selector', () => {
  describe('memoed selectors', () => {
    it('should get external data', () => {
      expect(getExternalData(mockState)).toEqual(externalData);
      expect(getExternalData(emptyState)).toEqual(null);
    });
  });
});

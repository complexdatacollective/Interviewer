/* eslint-env jest */

import * as Search from '../search';

const DefaultFuseOpts = {
  threshold: 0.5,
  minMatchCharLength: 1,
  shouldSort: true,
};

const externalNode = {
  uid: 'person_1',
  type: 'person',
  name: 'F. Anita',
  nickname: 'Annie',
  age: 23,
};

const mockProtocol = {
  externalData: {
    schoolPupils: {
      nodes: [externalNode, {
        name: 'C. Ronaldo',
      }],
    },
  },
};

const mockProps = {
  options: {},
  dataSource: 'schoolPupils',
};

const mockState = {
  protocol: mockProtocol,
};

describe('interface selector', () => {
  describe('memoed selectors', () => {
    it('should makeGetFuse', () => {
      const selector = Search.makeGetFuse(DefaultFuseOpts);
      expect(typeof selector(mockState, mockProps)).toBe('object');
    });
  });
});

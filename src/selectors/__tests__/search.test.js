/* eslint-env jest */
/* eslint-disable @codaco/spellcheck/spell-checker */

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

const mockProps = {
  options: {},
  dataSource: 'schoolPupils',
};

const mockState = {
  externalData: {
    schoolPupils: {
      nodes: [externalNode, {
        name: 'C. Ronaldo',
      }],
    },
  },
};

describe('search', () => {
  describe('memoed selectors', () => {
    it('should makeGetFuse', () => {
      const selector = Search.LEGACY_makeGetFuse(DefaultFuseOpts);
      expect(typeof selector(mockState, mockProps)).toBe('object');
    });
  });
});

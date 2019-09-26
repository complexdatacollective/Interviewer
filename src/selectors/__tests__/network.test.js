/* eslint-env jest */

import * as Network from '../network';

const mockNodeCodebookDefinition = {
  name: 'person',
  variables: {
    '80a0f680-3bc5-4bbe-af54-e05b387e82e6': {
      type: 'text',
      component: 'Text',
      validation: {
        required: true,
      },
      name: 'name',
    },
  },
};

// Mock a typical node in an interview, with UID attribute name
const mockNode1 = {
  '80a0f680-3bc5-4bbe-af54-e05b387e82e6': 'Node Label',
};

// Mock a typical node from an external data source where a name variable
// hasn't been mapped to a codebook variable UID
const mockNode2 = {
  name: 'Node Label',
};

// Mock a node with no valid name variable
const mockNode3 = {
  name01: 'Node Label',
};


describe('network selector', () => {
  describe('Node label logic', () => {
    it('uses the codebook to find a node attribute called name and returns it', () => {
      const label = Network.labelLogic(mockNodeCodebookDefinition, mockNode1);
      expect(label).toEqual('Node Label');
    });

    // handles external data
    it('uses the a variable called \'name\' on the node itself', () => {
      const label = Network.labelLogic(mockNodeCodebookDefinition, mockNode2);
      expect(label).toEqual('Node Label');
    });

    // fallback
    it('returns warning message when no suitable label is available', () => {
      const label = Network.labelLogic(mockNodeCodebookDefinition, mockNode3);
      expect(label).toEqual('No \'name\' variable!');
    });
  });
});

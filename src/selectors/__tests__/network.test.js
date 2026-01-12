/* eslint-env jest */
/* eslint-disable @codaco/spellcheck/spell-checker */

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

const mockNodeCodebookDefinitionWithCaps = {
  name: 'person',
  variables: {
    '80a0f680-3bc5-4bbe-af54-e05b387e82e6': {
      type: 'text',
      component: 'Text',
      validation: {
        required: true,
      },
      name: 'NaMe',
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

// Mock a typical node from an external data source where a name variable
const mockNode4 = {
  NamE: 'Node Label',
};

// Two valid name variables.
const mockNode5 = {
  NamE: 'First',
  nAMe: 'Second',
};

describe('network selector', () => {
  describe('Node label logic', () => {
    // Handles codebook lookup
    it('uses the codebook to find a node attribute called name and returns it', () => {
      const label = Network.labelLogic(mockNodeCodebookDefinition, mockNode1);
      expect(label).toEqual('Node Label');
    });

    it('handles irregularly capitalized codebook variable name', () => {
      const label = Network.labelLogic(mockNodeCodebookDefinitionWithCaps, mockNode1);
      expect(label).toEqual('Node Label');
    });

    // Handles external data
    it('uses the a variable called \'name\' on the node itself', () => {
      const label = Network.labelLogic(mockNodeCodebookDefinition, mockNode2);
      expect(label).toEqual('Node Label');
    });

    it('handles external data with name in irregular case', () => {
      const label = Network.labelLogic(mockNodeCodebookDefinition, mockNode4);
      expect(label).toEqual('Node Label');
    });

    it('returns fallback message when no suitable label is available', () => {
      const label = Network.labelLogic(mockNodeCodebookDefinition, mockNode3);
      expect(label).toEqual('No \'name\' variable!');
    });

    it('correctly handles multiple possible node attributes by using the first', () => {
      const label = Network.labelLogic(mockNodeCodebookDefinition, mockNode5);
      expect(label).toEqual('First');
    });
  });

  describe('getNodeLabel(nodeType)(state, nodeAttributes)', () => {
    const mockCodebook = { node: { person: mockNodeCodebookDefinition } };
    const mockState = {
      activeSessionId: 'mock',
      sessions: { mock: { protocolUID: 'mock' } },
      installedProtocols: {
        mock: {
          codebook: mockCodebook,
        },
      },
    };

    it('returns the correct node label', () => {
      expect(Network.getNodeLabel(mockState, 'person')(mockNode1))
        .toEqual('Node Label');
    });
  });
});

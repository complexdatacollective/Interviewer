/* eslint-env jest */
/* eslint-disable @codaco/spellcheck/spell-checker */

import * as Interface from '../interface';

const mockPrompt = {
  id: 'promptId123',
  text: 'sample protocol',
};

const mockStage = {
  id: 'stageId123',
  label: 'Welcome',
  type: 'Information',
  title: 'Title for the screen',
  additionalAttributes: [
    {
      variable: 'b6f2c4b9-e42f-459b-8f59-a11a685f460d',
      value: 2,
    },
  ],
  subject: {
    entity: 'node',
    type: 'person',
  },
};

const externalNode1 = {
  uid: 'person_1',
  type: 'person',
  promptIDs: ['promptId123'],
  attributes: {
    name: 'F. Anita',
    nickname: 'Annie',
    age: 23,
    label: 'Custom Label',
  },
};

const externalNode2 = {
  uid: 'person_2',
  type: 'person',
  promptIDs: ['promptId123'],
  attributes: {
    name: 'H. Barry',
    nickname: 'Baz',
    age: 31,
  },
};

const externalNode3 = {
  uid: 'person_3',
  type: 'person',
  promptIDs: ['promptId123'],
  attributes: {
    nickname: 'Carl',
    age: 25,
  },
};

const externalNode4 = {
  id: 4,
  uid: 'person_3',
  promptIDs: ['promptId123'],
  type: 'person',
  attributes: {
    age: 25,
  },
};

const mockProtocol = {
  externalData: {
    schoolPupils: {
      nodes: [externalNode1, externalNode2, externalNode3, externalNode4],
    },
  },
  codebook: {
    node: {
      person: {
        displayVariable: 'name',
        iconVariant: 'add-a-person',
        variables: {
          nickname: {
            type: 'text',
          },
          cat1: {
            type: 'categorical',
            options: [123, 456],
          },
          ord1: {
            type: 'ordinal',
          },
        },
      },
    },
  },
  stages: [mockStage],
};

const mockProps = {
  prompt: mockPrompt,
  stage: mockStage,
};

const emptyProps = {
  prompt: {
    subject: {},
  },
  stage: {},
};

const personNode = {
  uid: 1, promptIDs: ['promptIdxxx'], type: 'person', attributes: { name: 'foo' },
};
const closeFriendNode = {
  uid: 2, promptIDs: ['promptId123'], type: 'person', attributes: { name: 'bar', close_friend: true },
};
const nodes = [
  personNode,
  closeFriendNode,
  {
    uid: 3, promptIDs: ['promptId456'], attributes: { name: 'baz' }, type: 'venue',
  },
];

const edges = [{ to: 'bar', from: 'foo' }, { to: 'asdf', from: 'qwerty' }];

const mockState = {
  sessions: {
    a: {
      network: { nodes, edges },
      protocolUID: 'mockProtocol',
      sessionIndex: 0,
    },
  },
  activeSessionId: 'a',
  installedProtocols: { mockProtocol },
};

describe('interface selector', () => {
  describe('memoed selectors', () => {
    it('makeGetIds()', () => {
      const selected = Interface.makeGetIds();
      expect(selected(mockState, mockProps)).toEqual({
        stageId: mockStage.id,
        promptId: mockPrompt.id,
      });
    });

    it('makeGetAdditionalAttributes()', () => {
      const selected = Interface.makeGetAdditionalAttributes();
      expect(selected(mockState, mockProps)).toEqual({ 'b6f2c4b9-e42f-459b-8f59-a11a685f460d': 2 });
      expect(selected(null, emptyProps)).toEqual({});
    });

    it('makeGetSubject()', () => {
      const selected = Interface.makeGetSubject();
      expect(selected(mockState, mockProps)).toEqual(mockStage.subject);
      expect(selected(null, emptyProps)).toEqual({});
    });

    it('should get subject type', () => {
      const selected = Interface.makeGetSubjectType();
      expect(selected(mockState, mockProps)).toEqual('person');
    });

    it('makeGetVariableOptions', () => {
      const selected = Interface.makeGetVariableOptions();
      expect(selected(mockState, { ...mockProps, prompt: { ...mockPrompt, variable: 'cat1' } })).toEqual([123, 456]);
      expect(selected(mockState, { ...mockProps, prompt: { ...mockPrompt, variable: 'ord1' } })).toEqual([]);
    });

    it('makeNetworkNodesForType()', () => {
      const selected = Interface.makeNetworkNodesForType();
      expect(selected(mockState, mockProps)).toEqual([
        personNode,
        closeFriendNode,
      ]);
      expect(selected(mockState, emptyProps).length).toEqual(0);
    });

    it('makeNetworkEntitiesForType()', () => {
      const selected = Interface.makeNetworkEntitiesForType();
      expect(selected(mockState, mockProps)).toEqual([
        personNode,
        closeFriendNode,
      ]);
      expect(selected(mockState, emptyProps).length).toEqual(2);
    });

    it('makeNetworkNodesForPrompt()', () => {
      const selected = Interface.makeNetworkNodesForPrompt();
      expect(selected(mockState, mockProps)).toEqual([
        closeFriendNode,
      ]);
      expect(selected(mockState, emptyProps).length).toEqual(0);
    });

    it('makeNetworkNodesForOtherPrompts()', () => {
      const selected = Interface.makeNetworkNodesForOtherPrompts();
      expect(selected(mockState, mockProps)).toEqual([personNode]);
      expect(selected(mockState, emptyProps).length).toEqual(0);
    });
  });
});

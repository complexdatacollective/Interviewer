/* eslint-env jest */

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
  additionalAttributes: {
    close_friend: true,
  },
  subject: {
    entity: 'node',
    type: 'person',
  },
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

const personNode = { uid: 1, name: 'foo', type: 'person' };
const closeFriendNode = { uid: 2, name: 'bar', type: 'person', close_friend: true };
const nodes = [
  personNode,
  closeFriendNode,
  { uid: 3, name: 'baz', type: 'venue' },
];

const edges = [{ to: 'bar', from: 'foo' }, { to: 'asdf', from: 'qwerty' }];

const mockState = {
  network: { nodes, edges },
};

describe('interface selector', () => {
  describe('memoed selectors', () => {
    it('should get network nodes', () => {
      expect(Interface.networkNodes(mockState)).toEqual(nodes);
    });

    it('should get network edges', () => {
      expect(Interface.networkEdges(mockState)).toEqual(edges);
    });

    it('makeGetIds()', () => {
      const selected = Interface.makeGetIds();
      expect(selected(mockState, mockProps)).toEqual({
        stageId: mockStage.id,
        promptId: mockPrompt.id,
      });
    });

    it('makeGetAdditionalAttributes()', () => {
      const selected = Interface.makeGetAdditionalAttributes();
      expect(selected(mockState, mockProps)).toEqual(mockStage.additionalAttributes);
      expect(selected(null, emptyProps)).toEqual({});
    });

    it('makeGetSubject()', () => {
      const selected = Interface.makeGetSubject();
      expect(selected(mockState, mockProps)).toEqual(mockStage.subject);
      expect(selected(null, emptyProps)).toEqual({});
    });

    it('makeNetworkNodesForSubject()', () => {
      const selected = Interface.makeNetworkNodesForSubject();
      expect(selected(mockState, mockProps)).toEqual([
        personNode,
        closeFriendNode,
      ]);
      expect(selected(mockState, emptyProps).length).toEqual(0);
    });

    it('makeNetworkNodesForPrompt()', () => {
      const selected = Interface.makeNetworkNodesForPrompt();
      expect(selected(mockState, mockProps)).toEqual([
        closeFriendNode,
      ]);
      expect(selected(mockState, emptyProps).length).toEqual(3);
    });

    it('makeNetworkNodesForOtherPrompts()', () => {
      const selected = Interface.makeNetworkNodesForOtherPrompts();
      expect(selected(mockState, mockProps)).toEqual([personNode]);
      expect(selected(mockState, emptyProps).length).toEqual(0);
    });
  });
});

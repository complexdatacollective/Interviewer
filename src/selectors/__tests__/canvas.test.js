/* eslint-env jest */

import {
  makeGetNextUnplacedNode,
  makeGetPlacedNodes,
  makeGetDisplayEdges,
} from '../canvas';

const mockState = {
  session: 'testSession',
  sessions: {
    testSession: {
      network: {
        nodes: [
          { _uid: 1, type: 'person', attributes: { name: 'alpha', closeness: [1, 1] } },
          { _uid: 2, type: 'person', attributes: { name: 'foxtrot' } },
          { _uid: 3, type: 'person', attributes: { name: 'bravo' } },
          { _uid: 4, type: 'person', attributes: { name: 'echo', closeness: [1, 1] } },
          { _uid: 5, type: 'person', attributes: { name: 'charlie', closeness: [1, 1] } },
        ],
        edges: [
          { type: 'friend', from: 1, to: 4 },
          { type: 'friend', from: 4, to: 5 },
        ],
      },
    },
  },
};

describe('canvas selectors', () => {
  describe('makeGetPlacedNodes()', () => {
    const getPlacedNodes = makeGetPlacedNodes();

    it('selects all placed nodes', () => {
      const props = {
        subject: {
          entity: 'node',
          type: 'person',
        },
        layout: 'closeness',
      };

      const subject = getPlacedNodes(mockState, props);

      expect(subject).toEqual([
        { _uid: 1, type: 'person', attributes: { name: 'alpha', closeness: [1, 1] } },
        { _uid: 4, type: 'person', attributes: { name: 'echo', closeness: [1, 1] } },
        { _uid: 5, type: 'person', attributes: { name: 'charlie', closeness: [1, 1] } },
      ]);
    });
  });

  describe('makeGetNextUnplacedNode()', () => {
    const getNextUnplacedNode = makeGetNextUnplacedNode();

    it('selects the next unplaced node', () => {
      const props = {
        subject: {
          entity: 'node',
          type: 'person',
        },
        layout: 'closeness',
        displayEdges: [
          'friends',
        ],
      };

      const subject = getNextUnplacedNode(mockState, props);

      expect(subject).toMatchObject(
        { _uid: 2 },
      );
    });
  });

  describe('makeGetDisplayEdges', () => {
    const getDisplayEdges = makeGetDisplayEdges();

    it('selects edges for placed nodes, with coordinates', () => {
      const props = {
        subject: {
          entity: 'node',
          type: 'person',
        },
        layout: 'closeness',
        displayEdges: ['friend'],
      };

      const subject = getDisplayEdges(mockState, props);

      expect(subject).toEqual([
        { from: [1, 1], key: '1_friend_4', to: [1, 1], type: 'friend' },
        { from: [1, 1], key: '4_friend_5', to: [1, 1], type: 'friend' },
      ]);
    });
  });
});

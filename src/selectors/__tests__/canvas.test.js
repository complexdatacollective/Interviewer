/* eslint-env jest */

import { makeGetNextUnplacedNode, makeGetPlacedNodes } from '../canvas';

const mockState = {
  session: 'testSession',
  sessions: {
    testSession: {
      network: {
        nodes: [
          { type: 'person', attributes: { name: 'alpha', closeness: [1, 1] } },
          { type: 'person', attributes: { name: 'foxtrot' } },
          { type: 'person', attributes: { name: 'bravo' } },
          { type: 'person', attributes: { name: 'echo', closeness: [1, 1] } },
          { type: 'person', attributes: { name: 'charlie', closeness: [1, 1] } },
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
        { type: 'person', attributes: { name: 'alpha', closeness: [1, 1] } },
        { type: 'person', attributes: { name: 'echo', closeness: [1, 1] } },
        { type: 'person', attributes: { name: 'charlie', closeness: [1, 1] } },
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
        sortOrder: [
          { property: 'name', direction: 'asc' },
        ],
      };

      const subject = getNextUnplacedNode(mockState, props);

      expect(subject).toEqual(
        { attributes: { name: 'bravo' }, type: 'person' },
      );
    });
  });
});

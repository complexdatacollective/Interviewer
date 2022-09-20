/* eslint-env jest */
import { entityAttributesProperty } from '@codaco/shared-consts';
import {
  getNextUnplacedNode,
  getPlacedNodes,
} from '../canvas';

const node1 = { _uid: 1, type: 'person', [entityAttributesProperty]: { role: ['a'], name: 'alpha', closeness: [1, 1] } };
const node2 = { _uid: 2, type: 'person', [entityAttributesProperty]: { role: ['a'], name: 'foxtrot', closeness: null } };
const node3 = { _uid: 3, type: 'person', [entityAttributesProperty]: { role: ['a'], name: 'bravo', closeness: null } };
const node4 = { _uid: 4, type: 'person', [entityAttributesProperty]: { role: ['a'], name: 'echo', closeness: [1, 1] } };
const node5 = { _uid: 5, type: 'person', [entityAttributesProperty]: { role: [2], name: 'charlie', closeness: [1, 1] } };

const mockState = {
  activeSessionId: 'testSession',
  sessions: {
    testSession: {
      protocolUID: 'mockProtocol',
      stageIndex: 0,
      network: {
        nodes: [node1, node2, node3, node4, node5],
        edges: [
          { type: 'friend', from: 1, to: 4 },
          { type: 'friend', from: 4, to: 5 },
        ],
      },
    },
  },
  installedProtocols: {
    mockProtocol: {
      codebook: {
        node: {
          person: {},
        },
      },
      stages: [
        {
          subject: {
            entity: 'node',
            type: 'person',
          },
        },
      ],
    },
  },
};

describe('canvas selectors', () => {
  describe('makeGetPlacedNodes()', () => {
    it('selects all placed nodes', () => {
      const props = {
        prompt: {
          layout: {
            layoutVariable: 'closeness',
          },
        },
      };

      const subject = getPlacedNodes(mockState, props);

      expect(subject).toEqual([
        node1,
        node4,
        node5,
      ]);
    });
  });

  describe('makeGetNextUnplacedNode()', () => {
    it('selects the next unplaced node', () => {
      const props = {
        prompt: {
          layout: {
            layoutVariable: 'closeness',
          },
        },
      };

      const subject = getNextUnplacedNode(mockState, props);

      expect(subject).toMatchObject(
        { _uid: 2 },
      );
    });
  });

  describe('makeGetNextUnplacedNode() uses sort', () => {
    it('selects the next unplaced node', () => {
      const props = {
        prompt: {
          layout: {
            layoutVariable: 'closeness',
          },
          sortOrder: [
            {
              property: 'name',
              direction: 'asc',
            },
          ],
        },
      };

      const subject = getNextUnplacedNode(mockState, props);

      expect(subject).toMatchObject(
        { _uid: 3 },
      );
    });
  });
});

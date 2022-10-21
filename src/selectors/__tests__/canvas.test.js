/* eslint-disable @codaco/spellcheck/spell-checker */
/* eslint-env jest */
import { entityAttributesProperty } from '@codaco/shared-consts';
import {
  getNextUnplacedNode,
  getPlacedNodes,
} from '../canvas';

const node1 = { _uid: 1, type: 'person', [entityAttributesProperty]: { role: ['a'], name: 'alpha', personLayout: [1, 1] } };
const node2 = { _uid: 2, type: 'person', [entityAttributesProperty]: { role: ['a'], name: 'foxtrot', personLayout: null } };
const node3 = { _uid: 3, type: 'person', [entityAttributesProperty]: { role: ['a'], name: 'bravo', personLayout: null } };
const node4 = { _uid: 4, type: 'person', [entityAttributesProperty]: { role: ['a'], name: 'echo', personLayout: [1, 1] } };
const node5 = { _uid: 5, type: 'person', [entityAttributesProperty]: { role: [2], name: 'charlie', personLayout: [1, 1] } };
const node6 = { _uid: 6, type: 'place', [entityAttributesProperty]: { role: [2], name: 'delta', placeLayout: [1, 1] } };
const node7 = { _uid: 7, type: 'place', [entityAttributesProperty]: { role: [2], name: 'golf', placeLayout: null } };
const node8 = { _uid: 8, type: 'place', [entityAttributesProperty]: { role: [2], name: 'hotel', placeLayout: null } };
const node9 = { _uid: 9, type: 'place', [entityAttributesProperty]: { role: [2], name: 'india', placeLayout: [1, 1] } };
const node10 = { _uid: 10, type: 'place', [entityAttributesProperty]: { role: [2], name: 'juliet', placeLayout: [1, 1] } };

const mockNodes = [node1, node2, node3, node4, node5, node6, node7, node8, node9, node10];

const mockSingleSubject = {
  subject: {
    entity: 'node',
    type: 'person',
  },
};

const mockTwoModeSubject = {
  subject: [
    {
      entity: 'node',
      type: 'person',
    },
    {
      entity: 'node',
      type: 'place',
    },
  ],
};

const mockState = {
  activeSessionId: 'testSession',
  sessions: {
    testSession: {
      protocolUID: 'mockProtocol',
      stageIndex: 0,
      network: {
        nodes: mockNodes,
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
          place: {},
        },
      },
      stages: [
        {
          id: 1,
          name: 'Stage 1',
          ...mockSingleSubject,
        },
      ],
    },
  },
};

const mockTwoModeState = {
  activeSessionId: 'testSession',
  sessions: {
    testSession: {
      protocolUID: 'mockProtocol',
      stageIndex: 0,
      network: {
        nodes: mockNodes,
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
          place: {},
        },
      },
      stages: [
        {
          id: 1,
          name: 'Stage 1',
          ...mockTwoModeSubject,
        },
      ],
    },
  },
};

describe('canvas selectors', () => {
  describe('for single subject', () => {
    describe('makeGetPlacedNodes()', () => {
      it('selects all placed nodes', () => {
        const props = {
          prompt: {
            layout: {
              layoutVariable: 'personLayout',
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
      it.only('selects the next unplaced node', () => {
        const props = {
          prompt: {
            layout: {
              layoutVariable: 'personLayout',
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
              layoutVariable: 'personLayout',
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

  describe('for two-mode subject', () => {
    const props = {
      prompt: {
        layout: {
          layoutVariable: {
            person: 'personLayout',
            place: 'placeLayout',
          },
        },
      },
    };

    describe('makeGetPlacedNodes()', () => {
      it('selects all placed nodes', () => {
        const subject = getPlacedNodes(mockTwoModeState, props);

        expect(subject).toEqual([
          node1,
          node4,
          node5,
          node6,
          node9,
          node10,
        ]);
      });
    });

    describe('makeGetNextUnplacedNode()', () => {
      it.only('selects the next unplaced node', () => {
        const subject = getNextUnplacedNode(mockTwoModeState, props);

        expect(subject).toMatchObject(
          { _uid: 2 },
        );
      });
    });

    describe('makeGetNextUnplacedNode() uses sort', () => {
      it('selects the next unplaced node', () => {
        const propsWithSort = {
          ...props,
          prompt: {
            ...props.prompt,
            sortOrder: [
              {
                property: 'type',
                type: 'hierarchy',
                hierarchy: ['place', 'person'],
              },
              {
                property: 'name',
                type: 'string',
                direction: 'asc',
              },
            ],
          },
        };

        const subject = getNextUnplacedNode(mockTwoModeState, propsWithSort);

        expect(subject).toMatchObject(
          { _uid: 7 },
        );
      });
    });
  });
});

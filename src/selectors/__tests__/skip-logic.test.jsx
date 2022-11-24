/* eslint-env jest */
/* eslint-disable @codaco/spellcheck/spell-checker */

import { getNextIndex, isStageSkipped } from '../skip-logic';

import { getProtocolStages } from '../protocol';

const mockState = {
  activeSessionId: 'a',
  sessions: {
    a: {
      protocolUID: 'mockProtocol',
      network: {
        edges: [
          {
            id: 1, type: 'friend', to: 1, from: 2,
          },
        ],
        ego: {},
        nodes: [
          { type: 'person', attributes: { id: 1, name: 'soAndSo' } },
          { type: 'person', attributes: { id: 2, name: 'whoDunnit' } },
          { type: 'person', attributes: { id: 3, name: 'whatsErName' } },
        ],
      },
    },
  },
  installedProtocols: {
    mockProtocol: {
      stages: [
        { id: 1 },
        {
          id: 2,
          skipLogic: {
            action: 'SHOW',
            filter: {
              rules: [
                {
                  type: 'alter',
                  options: {
                    type: 'person',
                    attribute: 'name',
                    operator: 'GREATER_THAN',
                    value: 't',
                  },
                },
              ],
            },
          },
        },
        {
          id: 3,
          skipLogic: {
            action: 'SHOW',
            filter: {
              rules: [
                {
                  type: 'edge',
                  options: {
                    type: 'friend',
                    attribute: 'type',
                    operator: 'EXISTS',
                  },
                },
              ],
            },
          },
        },
        {
          id: 4,
          skipLogic: {
            action: 'SKIP',
            filter: {
              rules: [
                {
                  type: 'alter',
                  options: {
                    type: 'person',
                    attribute: 'id',
                    operator: 'GREATER_THAN_OR_EQUAL',
                    value: '1',
                  },
                },
              ],
            },
          },
        },
        {
          id: 5,
          skipLogic: {
            action: 'SKIP',
            filter: {
              rules: [
                {
                  type: 'alter',
                  options: {
                    type: 'person',
                    attribute: 'name',
                    operator: 'EXACTLY',
                    value: 'somePerson',
                  },
                },
              ],
            },
          },
        },
        {
          id: 6,
          skipLogic: {
            action: 'SKIP',
            filter: {
              join: 'AND',
              rules: [
                {
                  type: 'alter',
                  options: {
                    type: 'person',
                    attribute: 'name',
                    operator: 'EXACTLY',
                    value: 'soAndSo',
                  },
                },
                {
                  type: 'alter',
                  options: {
                    type: 'person',
                    attribute: 'id',
                    operator: 'EXACTLY',
                    value: 2,
                  },
                },
              ],
            },
          },
        },
        {
          id: 7,
          skipLogic: {
            action: 'SKIP',
            filter: {
              join: 'OR',
              rules: [
                {
                  type: 'alter',
                  options: {
                    type: 'person',
                    attribute: 'name',
                    operator: 'EXACTLY',
                    value: 'soAndSo',
                  },
                },
                {
                  type: 'alter',
                  options: {
                    type: 'person',
                    attribute: 'id',
                    operator: 'EXACTLY',
                    value: 2,
                  },
                },
              ],
            },
          },
        },
      ],
    },
  },
};

describe('skip-logic selector', () => {
  describe('getNextIndex()', () => {
    it('returns the index if valid', () => {
      const index = getNextIndex(1)(mockState);
      expect(index).toEqual(1);
    });

    it('rotates the index if out of bounds', () => {
      const stageCount = getProtocolStages(mockState).length;
      const index = getNextIndex(stageCount)(mockState);
      expect(index).toEqual(0);
    });
  });

  describe('isStageSkipped()', () => {
    it('shows any stage with missing skip logic', () => {
      const skipped = isStageSkipped(0)(mockState);
      expect(skipped).toEqual(false);
    });

    it('returns false for stage if show logic query is met', () => {
      const skipped = isStageSkipped(1)(mockState);
      expect(skipped).toEqual(false);
    });

    it('returns true for stage if show logic query is not met', () => {
      const skipped = isStageSkipped(2)(mockState);
      expect(skipped).toEqual(true);
    });

    it('returns true for stage if skip logic query is met', () => {
      const skipped = isStageSkipped(3)(mockState);
      expect(skipped).toEqual(true);
    });

    it('returns false for stage if skip logic query is not met', () => {
      const skipped = isStageSkipped(4)(mockState);
      expect(skipped).toEqual(false);
    });

    it('returns false for stage if skip logic query with AND is not met', () => {
      const skipped = isStageSkipped(5)(mockState);
      expect(skipped).toEqual(false);
    });

    it('returns false for stage if skip logic query with OR is not met', () => {
      const skipped = isStageSkipped(6)(mockState);
      expect(skipped).toEqual(true);
    });
  });
});

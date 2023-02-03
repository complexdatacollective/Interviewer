/* eslint-env jest */

import {
  getEdgeInNetwork,
  matchEntry,
  stageStateReducer,
  getIsPreviouslyAnsweredNo,
} from '../useEdgeState';

describe('useEdgeState', () => {
  describe('getEdgeInNetwork(edges, pair, edgeType)', () => {
    it('returns an edge for a pair if it exists', () => {
      const edges = [
        { type: 'friend', from: 1, to: 4 },
        { type: 'friend', from: 4, to: 5 },
      ];
      const pair1 = [1, 4];
      const pair2 = [4, 1];
      const pair3 = [4, 5];
      const pair4 = [5, 4];
      const edgeType = 'friend';

      expect(getEdgeInNetwork(edges, pair1, edgeType)).toEqual(edges[0]);
      expect(getEdgeInNetwork(edges, pair2, edgeType)).toEqual(edges[0]);
      expect(getEdgeInNetwork(edges, pair3, edgeType)).toEqual(edges[1]);
      expect(getEdgeInNetwork(edges, pair4, edgeType)).toEqual(edges[1]);
    });

    it('returns null for a pair if it does not exist', () => {
      const edges = [
        { type: 'friend', from: 1, to: 4 },
        { type: 'friend', from: 4, to: 5 },
      ];
      const pair1 = [1, 5];
      const edgeType = 'friend';

      expect(getEdgeInNetwork(edges, pair1, edgeType)).toEqual(null);
    });
  });

  describe('matchEntry(prompt, pair)', () => {
    it('returns a function that matches against stageState', () => {
      const entry = [0, 1, 2, undefined];

      expect(matchEntry(0, [1, 2])(entry)).toEqual(true);
      expect(matchEntry(0, [2, 1])(entry)).toEqual(true);
      expect(matchEntry(1, [1, 2])(entry)).toEqual(false);
    });
  });

  describe('stageStateReducer(state, { pair, prompt, value })', () => {
    it('replaces existing entries', () => {
      const state = [
        [0, 1, 2, false],
      ];

      expect(stageStateReducer(state, { pair: [1, 2], prompt: 0, value: true }))
        .toEqual([
          [0, 1, 2, true],
        ]);
    });

    it('adds new entries', () => {
      const state = [
        [0, 1, 2, false],
      ];

      expect(stageStateReducer(state, { pair: [1, 2], prompt: 1, value: true }))
        .toEqual([
          [0, 1, 2, false],
          [1, 1, 2, true],
        ]);
    });
  });

  describe('getIsPreviouslyAnsweredNo(state, prompt, pair)', () => {
    it('if match is false, returns true', () => {
      const state = [
        [0, 1, 2, false],
      ];

      expect(getIsPreviouslyAnsweredNo(state, 0, [1, 2]))
        .toEqual(true);
    });

    it('if match is true, returns false', () => {
      const state = [
        [0, 1, 2, true],
      ];

      expect(getIsPreviouslyAnsweredNo(state, 0, [1, 2]))
        .toEqual(false);
    });

    it('if no match, returns false', () => {
      const state = [
        [0, 1, 2, false],
      ];

      expect(getIsPreviouslyAnsweredNo(state, 1, [1, 2]))
        .toEqual(false);
    });
  });
});

/* eslint-env jest */

import { matchEntry, stageStateReducer, getIsPreviouslyAnsweredNo } from '../useEdgeState';

describe('useEdgeState', () => {
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

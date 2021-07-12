/* eslint-env jest */
/* eslint-disable @codaco/spellcheck/spell-checker */

import { translatePositions } from './useAutoLayout';

jest.mock('../../hooks/forceSimulation.worker');

describe('useAutoLayout()', () => {
  describe('translatePositions()', () => {
    it('returns an object', () => {
      const result = translatePositions(
        [],
      );

      expect(result).toEqual([
        {},
        {
          minY: null,
          minX: null,
          maxY: null,
          maxX: null,
          dY: null,
          dX: null,
        },
      ]);
    });

    it('returns positions indexed by id', () => {
      const positions = [
        { x: 1, y: 4, index: 0, id: 'test_node_1' },
        { x: 3, y: 2, index: 1, id: 'test_node_2' },
      ];

      const result = translatePositions(
        positions,
      );

      expect(result).toEqual([
        {
          test_node_1: { x: 0.1, y: 0.9 },
          test_node_2: { x: 0.9, y: 0.1 },
        },
        {
          dX: 2,
          dY: 2,
          minY: 2,
          maxY: 4,
          minX: 1,
          maxX: 3,
        },
      ]);
    });
  });
});

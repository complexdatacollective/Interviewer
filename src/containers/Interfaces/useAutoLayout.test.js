/* eslint-env jest */
/* eslint-disable @codaco/spellcheck/spell-checker */

import { transformLayout } from './useAutoLayout';

jest.mock('../../hooks/forceSimulation.worker');

describe('useAutoLayout()', () => {
  describe('transformLayout()', () => {
    it('returns two arrays', () => {
      const result = transformLayout(
        undefined,
        [],
        [],
        [],
        [],
      );

      expect(result).toEqual([[], []]);
    });

    it('returns unmatched nodes/edges intact', () => {
      const nodes = [
        { _uid: 'test_node_1', attributes: { name: 'foo' } },
        { _uid: 'test_node_2', attributes: { name: 'bar' } },
      ];

      const edges = [
        { key: 'test_edge_1', source: 'test_node_1', target: 'test_node_2' },
      ];

      const result = transformLayout(
        undefined,
        nodes,
        edges,
        [],
        [],
      );

      expect(result).toEqual([
        nodes,
        edges,
      ]);
    });

    it('returns resolved nodes and edges', () => {
      const nodes = [
        { _uid: 'test_node_1', attributes: { name: 'foo' } },
        { _uid: 'test_node_2', attributes: { name: 'bar' } },
      ];

      const edges = [
        { key: 'test_edge_1', ids: { from: 'test_node_1', to: 'test_node_2' } },
      ];

      const links = [
        { source: 0, target: 1 },
      ];

      const positions = [
        { x: 1, y: 4 },
        { x: 3, y: 2 },
      ];

      const result = transformLayout(
        'layout_var',
        nodes,
        edges,
        positions,
        links,
      );

      expect(result).toEqual([
        [
          {
            _uid: 'test_node_1',
            attributes: { name: 'foo', layout_var: { x: 0.1, y: 0.9 } },
          },
          {
            _uid: 'test_node_2',
            attributes: { name: 'bar', layout_var: { x: 0.9, y: 0.1 } },
          },
        ],
        [
          {
            key: 'test_edge_1',
            ids: { from: 'test_node_1', to: 'test_node_2' },
            from: { x: 0.1, y: 0.9 },
            to: { x: 0.9, y: 0.1 },
          },
        ],
      ]);
    });
  });
});

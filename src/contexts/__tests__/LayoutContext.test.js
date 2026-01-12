/* eslint-disable @codaco/spellcheck/spell-checker */
import { vi } from 'vitest';
/* eslint-disable @codaco/spellcheck/spell-checker */

import { entityPrimaryKeyProperty } from '@codaco/shared-consts';
import { getLinks } from '../LayoutContext';

vi.mock('../../hooks/forceSimulation.worker');

const testNodes = [
  { [entityPrimaryKeyProperty]: '1111' },
  { [entityPrimaryKeyProperty]: '2222' },
  { [entityPrimaryKeyProperty]: '3333' },
  { [entityPrimaryKeyProperty]: '4444' },
];

const testEdges = [
  { from: '1111', to: '2222' },
  { from: '2222', to: '4444' },
];

describe('getLinks', () => {
  it('empty nodes/edges returns empty list', () => {
    expect(getLinks({ nodes: [], edges: [] })).toEqual([]);
    expect(getLinks({ nodes: testNodes, edges: [] })).toEqual([]);
    expect(getLinks({ nodes: [], edges: testEdges })).toEqual([]);
  });

  it('Returns a list of links by index', () => {
    expect(getLinks({ nodes: testNodes, edges: testEdges })).toEqual([
      { source: 0, target: 1 },
      { source: 1, target: 3 },
    ]);
  });
});

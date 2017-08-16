/* eslint-disable import/prefer-default-export */
import { createSelector } from 'reselect';
import { filter, find } from 'lodash';
import { activePrompt, activePromptLayout } from './session';
import { nodesOfStageType } from './nodes';

const getCoords = (nodes, edge, layout) => {
  const from = find(nodes, ['id', edge.from]);
  const to = find(nodes, ['id', edge.to]);

  if (!from || !to) { return { from: null, to: null }; }

  return {
    key: `${edge.from}_${edge.type}_${edge.to}`,
    from: from[layout],
    to: to[layout],
  };
};

const edgeCoordsForLayout = (edges, nodes, layout) =>
  edges.map(edge => getCoords(nodes, edge, layout));

const allEdges = state => state.network.edges;

export const edgesForPrompt = createSelector(
  allEdges,
  activePrompt,
  (edges, prompt) => filter(edges, ['type', prompt.edgeType]),
);

export const edgeCoordsForPrompt = createSelector(
  edgesForPrompt,
  nodesOfStageType,
  activePromptLayout,
  (edges, nodes, layout) => edgeCoordsForLayout(edges, nodes, layout),
);

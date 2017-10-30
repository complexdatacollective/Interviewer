/* eslint-disable import/prefer-default-export */

import { createSelector } from 'reselect';
import { filter, has } from 'lodash';
import { createDeepEqualSelector } from './utils';

// Prop selectors

export const propPromptLayout = (_, props) => props.prompt.layout.layoutVariable;
const propPromptNodeType = (_, props) => props.prompt.nodeType;
const propPromptDisplayEdges = (_, props) => props.prompt.edges.display;
export const propPromptCreateEdges = (_, props) => props.prompt.edges.create;

// MemoedSelectors

export const networkEdges = createDeepEqualSelector(
  state => state.network.edges,
  nodes => nodes,
);

export const networkNodes = createDeepEqualSelector(
  state => state.network.nodes,
  nodes => nodes,
);

export const makeNetworkNodesOfPromptType = () =>
  createSelector(
    [networkNodes, propPromptNodeType],
    (nodes, nodeType) => filter(nodes, ['type', nodeType]),
  );

export const makeDisplayEdgesForPrompt = () => {
  const networkNodesOfPromptType = makeNetworkNodesOfPromptType();

  return createSelector(
    [networkNodesOfPromptType, networkEdges, propPromptDisplayEdges, propPromptLayout],
    (nodes, edges, displayEdges, layout) =>
      displayEdges.map((type) => {
        const edgesOfType = filter(edges, { type });
        return edgesOfType.map((edge) => {
          const from = find(nodes, ['id', edge.from]);
          const to = find(nodes, ['id', edge.to]);

          if (!from || !to) { return { from: null, to: null }; }

          return {
            key: `${edge.from}_${edge.type}_${edge.to}`,
            from: from[layout],
            to: to[layout],
          };
        });
      }),
  );
};

export const makeGetPlacedNodes = () => {
  const networkNodesOfPromptType = makeNetworkNodesOfPromptType();

  return createSelector(
    [networkNodesOfPromptType, propPromptLayout],
    (nodes, layout) => filter(nodes, node => has(node, layout)),
  );
};

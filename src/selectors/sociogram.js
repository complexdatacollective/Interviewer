/* eslint-disable */
/* eslint-disable import/prefer-default-export */

import { createSelector } from 'reselect';
import { filter, has, reject, first, toPairs } from 'lodash';
import { createDeepEqualSelector } from './utils';

// Prop selectors

const propPromptNodeType = (_, props) => props.prompt.nodeType;
const propPromptLayout = (_, props) => props.prompt.layout;
const propPromptEdges = (_, props) => props.prompt.edges;
const propPromptHighlight = (_, props) => props.prompt.highlight;
const propPromptBackground = (_, props) => props.prompt.background;
const propPromptSort = (_, props) => props.prompt.nodeBinSortOrder;

// MemoedSelectors

const edgeOptions = createDeepEqualSelector(
  propPromptEdges,
  (edges) => ({
    displayEdges: has(edges, 'display') ? edges.display : [],
    createEdges: has(edges, 'create') ? edges.create : null,
    canCreateEdge: has(edges, 'create') ? true : false,
  }),
);

const highlightOptions = createDeepEqualSelector(
  propPromptHighlight,
  (highlight) => ({
    canHighlight: has(highlight, 'allowHighting') ? highlight.allowHighlighting : false,
    highlightAttributes: has(highlight, 'allowHighting') ? { [highlight.variable]: props.prompt.highlight.value } : {},
  }),
);

const layoutOptions = createDeepEqualSelector(
  propPromptLayout,
  (layout) => layout,
);

const sortOptions = createDeepEqualSelector(
  propPromptSort,
  (sort) => ({
    sort: toPairs(sort),
  }),
)

const selectMode = ({ edges, highlight }) => {
  if(edges.canCreateEdge) { return 'EDGE'; }
  if(highlight.canHighlighting) { return 'HIGHLIGHT'; }
  return null;
}

export const makeGetSociogramOptions = () =>
  createDeepEqualSelector(
    propPromptNodeType, layoutOptions, edgeOptions, highlightOptions, propPromptBackground, propPromptSort,
    (nodeType, layout, edges, highlight, background, sort) => ({
      nodeType,
      ...layout,
      ...edges,
      ...highlight,
      allowSelect: highlight.canHighlight || edges.canCreateEdge,
      selectMode: selectMode({ edges, highlight }),
      sort,
      background,
    }),
  );

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

const makeGetUnplacedNodes = () => {
  const networkNodesOfPromptType = makeNetworkNodesOfPromptType();

  return createSelector(
    [networkNodesOfPromptType, layoutOptions],
    (nodes, layout) => reject(nodes, node => has(node, layout.layoutVariable)),
  );
};

// TODO
export const makeGetNextUnplacedNode = () => {
  const getUnplacedNodes = makeGetUnplacedNodes();

  return createSelector(
    getUnplacedNodes, sortOptions,
    nodes => first(nodes),
    // (nodes, sort) => {
    //   let sortedNodes = [...nodes];
    //   if (sort && sort.by) { sortedNodes = sortBy([...sortedNodes], sort.by); }
    //   if (sort && sort.order === 'DESC') { sortedNodes = [...sortedNodes].reverse(); }
    //   return first(sortedNodes);
    // },
  );
};

export const makeDisplayEdgesForPrompt = () => {
  const networkNodesOfPromptType = makeNetworkNodesOfPromptType();

  return createSelector(
    [networkNodesOfPromptType, networkEdges, edgeOptions, layoutOptions],
    (nodes, edges, edgeOptions, { layoutVariable }) => {
      console.log(nodes, edges, edgeOptions, { layoutVariable });
      return edgeOptions.displayEdges.map((type) => {
        const edgesOfType = filter(edges, { type });
        return edgesOfType.map((edge) => {
          const from = find(nodes, ['id', edge.from]);
          const to = find(nodes, ['id', edge.to]);

          if (!from || !to) { return { from: null, to: null }; }

          return {
            key: `${edge.from}_${edge.type}_${edge.to}`,
            from: from[layoutVariable],
            to: to[layoutVariable],
          };
        });
      });
    }
  );
};

export const makeGetPlacedNodes = () => {
  const networkNodesOfPromptType = makeNetworkNodesOfPromptType();

  return createSelector(
    networkNodesOfPromptType, layoutOptions,
    (nodes, { layoutVariable }) => filter(nodes, node => has(node, layoutVariable)),
  );
};

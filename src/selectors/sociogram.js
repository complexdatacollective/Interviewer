/* eslint-disable import/prefer-default-export */

import { createSelector } from 'reselect';
import { filter, has, reject, first, toPairs } from 'lodash';
import { PropTypes } from 'prop-types';
import { createDeepEqualSelector } from './utils';

// Prop selectors

const propPromptNodeType = (_, props) => props.prompt.nodeType;
const propPromptLayout = (_, props) => props.prompt.layout;
const propPromptEdges = (_, props) => props.prompt.edges;
const propPromptHighlight = (_, props) => props.prompt.highlight;
const propPromptBackground = (_, props) => props.prompt.background;
const propPromptSort = (_, props) => props.prompt.nodeBinSortOrder;

// MemoedSelectors

const getEdgeOptions = createDeepEqualSelector(
  propPromptEdges,
  edges => ({
    displayEdges: has(edges, 'display') ? edges.display : [],
    createEdge: has(edges, 'create') ? edges.create : null,
    canCreateEdge: has(edges, 'create'),
  }),
);

const getHighlightOptions = createDeepEqualSelector(
  propPromptHighlight,
  highlight => ({
    canHighlight: has(highlight, 'allowHighting') ? highlight.allowHighlighting : false,
    highlightAttributes: has(highlight, 'allowHighting') ? { [highlight.variable]: highlight.value } : {},
  }),
);

const getLayoutOptions = createDeepEqualSelector(
  propPromptLayout,
  layout => layout,
);

const getSortOptions = createDeepEqualSelector(
  propPromptSort,
  sort => ({
    sort: toPairs(sort),
  }),
);

const getBackgroundOptions = createDeepEqualSelector(
  propPromptBackground,
  background => ({
    concentricCircles: has(background, 'concentricCircles') ? background.concentricCircles : undefined,
    skewedTowardCenter: has(background, 'skewedTowardCenter') ? background.skewedTowardCenter : true,
    image: has(background, 'image') ? background.image : undefined,
  }),
);


const selectMode = ({ edgeOptions: { canCreateEdge }, highlightOptions: { canHighlight } }) => {
  if (canCreateEdge) { return 'EDGE'; }
  if (canHighlight) { return 'HIGHLIGHT'; }
  return null;
};

export const makeGetSociogramOptions = () =>
  createDeepEqualSelector(
    propPromptNodeType,
    getLayoutOptions,
    getEdgeOptions,
    getHighlightOptions,
    getBackgroundOptions,
    getSortOptions,
    (nodeType, layoutOptions, edgeOptions, highlightOptions, backgroundOptions, sortOptions) => ({
      nodeType,
      ...layoutOptions,
      ...edgeOptions,
      ...highlightOptions,
      ...sortOptions,
      ...backgroundOptions,
      allowSelect: highlightOptions.canHighlight || edgeOptions.canCreateEdge,
      selectMode: selectMode({ edgeOptions, highlightOptions }),
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
    networkNodes, propPromptNodeType,
    (nodes, nodeType) => filter(nodes, ['type', nodeType]),
  );

const makeGetUnplacedNodes = () => {
  const networkNodesOfPromptType = makeNetworkNodesOfPromptType();

  return createSelector(
    networkNodesOfPromptType, getLayoutOptions,
    (nodes, { layoutVariable }) => reject(nodes, node => has(node, layoutVariable)),
  );
};

// TODO
export const makeGetNextUnplacedNode = () => {
  const getUnplacedNodes = makeGetUnplacedNodes();

  return createSelector(
    getUnplacedNodes, getSortOptions,
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
    [networkNodesOfPromptType, networkEdges, getEdgeOptions, getLayoutOptions],
    (nodes, edges, edgeOptions, { layoutVariable }) =>
      edgeOptions.displayEdges.map((type) => {
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
      }),
  );
};

export const makeGetPlacedNodes = () => {
  const networkNodesOfPromptType = makeNetworkNodesOfPromptType();

  return createSelector(
    networkNodesOfPromptType, getLayoutOptions,
    (nodes, { layoutVariable }) => filter(nodes, node => has(node, layoutVariable)),
  );
};

// PropTypes

export const sociogramOptionsProps = {
  nodeType: PropTypes.string.isRequired,
  layoutVariable: PropTypes.string.isRequired,
  allowPositioning: PropTypes.bool.isRequired,
  createEdge: PropTypes.string.isRequired,
  displayEdges: PropTypes.array.isRequired,
  canCreateEdge: PropTypes.bool.isRequired,
  canHighlight: PropTypes.bool.isRequired,
  highlightAttributes: PropTypes.object.isRequired,
  allowSelect: PropTypes.bool.isRequired,
  selectMode: PropTypes.string.isRequired,
  sort: PropTypes.array.isRequired,
  concentricCircles: PropTypes.number.isRequired,
  skewedTowardCenter: PropTypes.bool.isRequired,
};

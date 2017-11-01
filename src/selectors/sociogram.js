/* eslint-disable import/prefer-default-export */

import { createSelector } from 'reselect';
import { map, filter, has, reject, first, toPairs, unzip, orderBy, lowerCase, groupBy, at, values, flow } from 'lodash';
import { PropTypes } from 'prop-types';
import { networkEdges, makeNetworkNodesForSubject } from './interface';
import { createDeepEqualSelector } from './utils';

// Selectors that are specific to the name generator

/*
These selectors assume the following props:
  stage: which contains the protocol config for the stage
  prompt: which contains the protocol config for the prompt
*/

// Prop selectors

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
  sort => ({ nodeBinSortOrder: sort }),
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
    getLayoutOptions,
    getEdgeOptions,
    getHighlightOptions,
    getBackgroundOptions,
    getSortOptions,
    (layoutOptions, edgeOptions, highlightOptions, backgroundOptions, sortOptions) => ({
      ...layoutOptions,
      ...edgeOptions,
      ...highlightOptions,
      ...sortOptions,
      ...backgroundOptions,
      allowSelect: highlightOptions.canHighlight || edgeOptions.canCreateEdge,
      selectMode: selectMode({ edgeOptions, highlightOptions }),
    }),
  );

const makeGetUnplacedNodes = () => {
  const networkNodesForSubject = makeNetworkNodesForSubject();

  return createSelector(
    networkNodesForSubject, getLayoutOptions,
    (nodes, { layoutVariable }) => reject(nodes, node => has(node, layoutVariable)),
  );
};

// TODO
export const makeGetNextUnplacedNode = () => {
  const getUnplacedNodes = makeGetUnplacedNodes();

  return createSelector(
    getUnplacedNodes, getSortOptions,
    (nodes, sortOptions) => {
      const [properties, orders] = unzip(toPairs(sortOptions.nodeBinSortOrder));
      const sortedNodes = orderBy([...nodes], properties, orders.map(lowerCase));
      return first(sortedNodes);
    },
  );
};

const edgeCoords = (edge, { nodes, layoutVariable }) => {
  const from = find(nodes, ['id', edge.from]);
  const to = find(nodes, ['id', edge.to]);

  if (!from || !to) { return { from: null, to: null }; }

  return {
    key: `${edge.from}_${edge.type}_${edge.to}`,
    type: edge.type,
    from: from[layoutVariable],
    to: to[layoutVariable],
  };
};

const edgesToCoords = (edges, { nodes, layoutVariable }) =>
  map(
    edge => edgeCoords(edge, { nodes, layoutVariable }),
    edges,
  );

// const edgesOfType = (edges, type) => filter(edges, { type });
// const edgesOfTypeToCoords = (edgeType, { edges, nodes, layoutVariable }) =>
//   edgesToCoords(
//     edgesOfType(edges, edgeType),
//     { nodes, layoutVariable },
//   );

const edgesOfTypes = (edges, types) =>
  flow(
    allEdges => groupBy(allEdges, 'type'), // sort by type
    groupedEdges => at(groupedEdges, types), // discard unwanted types
    groupedEdges => values(groupedEdges), // flatten
  )(edges);

export const makeDisplayEdgesForPrompt = () => {
  const networkNodesForSubject = makeNetworkNodesForSubject();

  return createSelector(
    networkNodesForSubject,
    networkEdges,
    getEdgeOptions,
    getLayoutOptions,
    (nodes, edges, edgeOptions, { layoutVariable }) =>
      edgesToCoords(
        edgesOfTypes(edges, edgeOptions.displayEdges),
        { nodes, layoutVariable },
      ),
    // map(
    //   edgeOptions.displayEdges,
    //   edgeType => edgesOfTypeToCoords(edgeType, { edges, nodes, layoutVariable }),
    // ),
  );
};

export const makeGetPlacedNodes = () => {
  const networkNodesForSubject = makeNetworkNodesForSubject();

  return createSelector(
    networkNodesForSubject,
    getLayoutOptions,
    (nodes, { layoutVariable }) =>
      filter(nodes, node => has(node, layoutVariable)),
  );
};

// PropTypes

export const sociogramOptionsProps = {
  layoutVariable: PropTypes.string.isRequired,
  allowPositioning: PropTypes.bool.isRequired,
  createEdge: PropTypes.string.isRequired,
  displayEdges: PropTypes.array.isRequired,
  canCreateEdge: PropTypes.bool.isRequired,
  canHighlight: PropTypes.bool.isRequired,
  highlightAttributes: PropTypes.object.isRequired,
  allowSelect: PropTypes.bool.isRequired,
  selectMode: PropTypes.string.isRequired,
  nodeBinSortOrder: PropTypes.object.isRequired,
  concentricCircles: PropTypes.number.isRequired,
  skewedTowardCenter: PropTypes.bool.isRequired,
};

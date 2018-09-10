/* eslint-disable import/prefer-default-export */

import { createSelector } from 'reselect';
import {
  filter,
  has,
  get,
  reject,
  first,
  groupBy,
  pick,
  values,
  flatten,
  flow,
  isEmpty,
} from 'lodash';
import {
  networkEdges,
  makeGetNodeDisplayVariable,
  makeNetworkNodesForType,
} from './interface';
import { createDeepEqualSelector } from './utils';
import sortOrder from '../utils/sortOrder';
import { nodePrimaryKeyProperty, nodeAttributesProperty } from '../ducks/modules/network';

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
const propPromptSort = (_, props) => props.prompt.sortOrder;

// MemoedSelectors

const makeGetEdgeOptions = () =>
  createDeepEqualSelector(
    propPromptEdges,
    edges => ({
      displayEdges: get(edges, 'display', []),
      createEdge: get(edges, 'create', undefined),
      canCreateEdge: has(edges, 'create'),
    }),
  );

const makeGetHighlightOptions = () =>
  createDeepEqualSelector(
    makeGetEdgeOptions(),
    propPromptHighlight,
    (edges, highlight) => {
      const allowHighlighting = highlight && !edges.canCreateEdge ? get(highlight, 'allowHighlighting', true) : false;
      return ({
        allowHighlighting,
        highlightAttributes: has(highlight, 'variable') ?
          { [highlight.variable]: highlight.value } :
          undefined,
      });
    },
  );

const getLayoutOptions = createDeepEqualSelector(
  propPromptLayout,
  layout => layout,
);

const getSortOptions = createDeepEqualSelector(
  propPromptSort,
  makeGetNodeDisplayVariable(),
  (sort, displayVariable) => (sort && !isEmpty(sort) ? { sortOrder: sort } : { sortOrder: [{ property: displayVariable, direction: 'asc' }] }),
);

const getBackgroundOptions = createDeepEqualSelector(
  propPromptBackground,
  background => ({
    concentricCircles: has(background, 'concentricCircles') ? background.concentricCircles : undefined,
    skewedTowardCenter: has(background, 'skewedTowardCenter') ? background.skewedTowardCenter : true,
    image: get(background, 'image', undefined),
  }),
);

export const makeGetSociogramOptions = () =>
  createDeepEqualSelector(
    getLayoutOptions,
    makeGetEdgeOptions(),
    makeGetHighlightOptions(),
    getBackgroundOptions,
    getSortOptions,
    (layoutOptions, edgeOptions, highlightOptions, backgroundOptions, sortOptions) => ({
      ...layoutOptions,
      ...edgeOptions,
      ...highlightOptions,
      ...sortOptions,
      ...backgroundOptions,
      allowSelect: edgeOptions.canCreateEdge || highlightOptions.allowHighlighting,
    }),
  );

const makeGetUnplacedNodes = () => {
  const networkNodesForSubject = makeNetworkNodesForType();

  return createSelector(
    networkNodesForSubject, getLayoutOptions,
    (nodes, { layoutVariable }) =>
      reject(nodes, node => has(node[nodeAttributesProperty], layoutVariable)),
  );
};

export const makeGetNextUnplacedNode = () => {
  const getUnplacedNodes = makeGetUnplacedNodes();

  return createSelector(
    getUnplacedNodes, getSortOptions,
    (nodes, sortOptions) => {
      const sorter = sortOrder(sortOptions.sortOrder);
      return first(sorter(nodes));
    },
  );
};

const edgeCoords = (edge, { nodes, layoutVariable }) => {
  const from = nodes.find(n => n[nodePrimaryKeyProperty] === edge.from);
  const to = nodes.find(n => n[nodePrimaryKeyProperty] === edge.to);

  if (!from || !to) { return { from: null, to: null }; }

  return {
    key: `${edge.from}_${edge.type}_${edge.to}`,
    type: edge.type,
    from: from[nodeAttributesProperty][layoutVariable],
    to: to[nodeAttributesProperty][layoutVariable],
  };
};

const edgesToCoords = (edges, { nodes, layoutVariable }) =>
  edges.map(
    edge => edgeCoords(
      edge,
      { nodes, layoutVariable },
    ),
  );

const edgesOfTypes = (edges, types) =>
  flow(
    allEdges => groupBy(allEdges, 'type'), // sort by type
    groupedEdges => pick(groupedEdges, types), // discard unwanted types
    groupedEdges => values(groupedEdges), // flatten
    selectedEdges => flatten(selectedEdges),
  )(edges);

export const makeDisplayEdgesForPrompt = () => {
  const networkNodesForSubject = makeNetworkNodesForType();

  return createSelector(
    networkNodesForSubject,
    networkEdges,
    makeGetEdgeOptions(),
    getLayoutOptions,
    (nodes, edges, edgeOptions, { layoutVariable }) => {
      const selectedEdges = edgesOfTypes(edges, edgeOptions.displayEdges);
      return edgesToCoords(
        selectedEdges,
        { nodes, layoutVariable },
      );
    },
  );
};

export const makeGetPlacedNodes = () => {
  const networkNodesForSubject = makeNetworkNodesForType();

  return createSelector(
    networkNodesForSubject,
    getLayoutOptions,
    (nodes, { layoutVariable }) =>
      filter(nodes, node => has(node[nodeAttributesProperty], layoutVariable)),
  );
};

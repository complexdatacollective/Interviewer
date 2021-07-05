import {
  first,
  get,
  has,
  isNil,
} from 'lodash';
import { getNetworkNodes, getNetworkEdges } from './network';
import { createDeepEqualSelector } from './utils';
import sortOrder from '../utils/sortOrder';
import {
  getEntityAttributes,
  entityPrimaryKeyProperty,
  entityAttributesProperty,
} from '../ducks/modules/network';
import { getStageSubject } from './session';

const getLayout = (_, props) => get(props, 'prompt.layout.layoutVariable');
const getSortOptions = (_, props) => get(props, 'prompt.sortOrder');
const getDisplayEdges = (_, props) => get(props, 'prompt.edges.display', []);

/**
 * Selector for next unplaced node.
 *
 * requires:
 * { layout, subject, sortOrder, stage } props
 */
export const makeGetNextUnplacedNode = () => createDeepEqualSelector(
  getNetworkNodes,
  getStageSubject(),
  getLayout,
  getSortOptions,
  (nodes, subject, layoutVariable, sortOptions) => {
    const type = subject && subject.type;
    const unplacedNodes = nodes.filter((node) => {
      const attributes = getEntityAttributes(node);
      return (
        node.type === type
        && (has(attributes, layoutVariable) && isNil(attributes[layoutVariable]))
      );
    });
    const sorter = sortOrder(sortOptions);
    return first(sorter(unplacedNodes));
  },
);

/**
 * Selector for placed nodes.
 *
 * requires:
 * { layout, subject } props
 */
export const makeGetPlacedNodes = () => createDeepEqualSelector(
  getNetworkNodes,
  getStageSubject(),
  getLayout,
  (nodes, subject, layoutVariable) => {
    const type = subject && subject.type;

    return nodes.filter((node) => {
      const attributes = getEntityAttributes(node);
      return (
        node.type === type
        && (has(attributes, layoutVariable) && !isNil(attributes[layoutVariable]))
      );
    });
  },
);

const edgeCoords = (edge, { nodes, layout }) => {
  const from = nodes.find((n) => n[entityPrimaryKeyProperty] === edge.from);
  const to = nodes.find((n) => n[entityPrimaryKeyProperty] === edge.to);

  if (!from || !to) { return { from: null, to: null }; }

  return {
    key: `${edge.from}_${edge.type}_${edge.to}`,
    ids: { from: edge.from, to: edge.to },
    type: edge.type,
    from: from[entityAttributesProperty][layout],
    to: to[entityAttributesProperty][layout],
  };
};

export const edgesToCoords = (edges, { nodes, layout }) => edges.map(
  (edge) => edgeCoords(
    edge,
    { nodes, layout },
  ),
);

/**
 * Selector for edges.
 *
 * requires:
 * { subject, layout, displayEdges } props
 */
export const makeGetDisplayEdges = () => {
  const getPlacedNodes = makeGetPlacedNodes();

  return createDeepEqualSelector(
    getPlacedNodes,
    getNetworkEdges,
    getDisplayEdges,
    getLayout,
    (nodes, edges, displayEdges, layout) => {
      const selectedEdges = edges.filter((edge) => displayEdges.includes(edge.type));

      return edgesToCoords(
        selectedEdges,
        { nodes, layout },
      );
    },
  );
};

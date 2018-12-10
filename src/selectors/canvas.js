import { first, has, groupBy } from 'lodash';
import { networkNodes, networkEdges } from './interface';
import { createDeepEqualSelector } from './utils';
import sortOrder from '../utils/sortOrder';
import {
  getNodeAttributes,
  nodePrimaryKeyProperty,
  nodeAttributesProperty,
} from '../ducks/modules/network';

const getLayout = (_, props) => props.layoutVariable;
const getCategoricalVariable = (_, props) => props.groupVariable;
const getSubject = (_, props) => props.subject;
const getSortOptions = (_, props) => props.sortOrder;
const getDisplayEdges = (_, props) => props.displayEdges;

/**
 * Selector for next unplaced node.
 *
 * requires:
 * { layout, subject, sortOrder } props
 */
export const makeGetNextUnplacedNode = () =>
  createDeepEqualSelector(
    networkNodes,
    getSubject,
    getLayout,
    getSortOptions,
    (nodes, subject, layout, sortOptions) => {
      const type = subject && subject.type;

      const unplacedNodes = nodes.filter((node) => {
        const attributes = getNodeAttributes(node);

        return (
          node.type === type &&
          !has(attributes, layout)
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
export const makeGetPlacedNodes = () =>
  createDeepEqualSelector(
    networkNodes,
    getSubject,
    getLayout,
    (nodes, subject, layout) => {
      const type = subject && subject.type;

      return nodes.filter((node) => {
        const attributes = getNodeAttributes(node);

        return (
          node.type === type &&
          has(attributes, layout)
        );
      });
    },
  );

/**
 * Selector for nodes by group.
 */

export const makeGetNodesByCategorical = () => {
  const getPlacedNodes = makeGetPlacedNodes();
  return createDeepEqualSelector(
    getPlacedNodes,
    getCategoricalVariable,
    (nodes, categoricalVariable) =>
      groupBy(nodes, node => node[nodeAttributesProperty][categoricalVariable]),
  );
};

const edgeCoords = (edge, { nodes, layout }) => {
  const from = nodes.find(n => n[nodePrimaryKeyProperty] === edge.from);
  const to = nodes.find(n => n[nodePrimaryKeyProperty] === edge.to);

  if (!from || !to) { return { from: null, to: null }; }

  return {
    key: `${edge.from}_${edge.type}_${edge.to}`,
    type: edge.type,
    from: from[nodeAttributesProperty][layout],
    to: to[nodeAttributesProperty][layout],
  };
};

const edgesToCoords = (edges, { nodes, layout }) =>
  edges.map(
    edge => edgeCoords(
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
    networkEdges,
    getDisplayEdges,
    getLayout,
    (nodes, edges, displayEdges, layout) => {
      const selectedEdges = edges.filter(edge => displayEdges.includes(edge.type));

      return edgesToCoords(
        selectedEdges,
        { nodes, layout },
      );
    },
  );
};

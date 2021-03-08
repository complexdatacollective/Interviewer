import { first, has, isNil } from 'lodash';
import { getNetworkNodes, getNetworkEdges } from './network';
import { createDeepEqualSelector } from './utils';
import sortOrder from '../utils/sortOrder';
import {
  getEntityAttributes,
  entityPrimaryKeyProperty,
  entityAttributesProperty,
} from '../ducks/modules/network';

const getLayout = (_, props) => props.layoutVariable;
const getSubject = (_, props) => props.subject;
const getCategoricalVariable = (_, props) => props.groupVariable;
const getSortOptions = (_, props) => props.sortOrder;
const getDisplayEdges = (_, props) => props.displayEdges;

/**
 * Selector for next unplaced node.
 *
 * requires:
 * { layout, subject, sortOrder, stage } props
 */
export const makeGetNextUnplacedNode = () => createDeepEqualSelector(
  getNetworkNodes,
  getSubject,
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
  getSubject,
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

/**
 * Selector for nodes by group (categorical) variable.
 */

export const makeGetNodesByCategorical = () => {
  const getPlacedNodes = makeGetPlacedNodes();
  return createDeepEqualSelector(
    getPlacedNodes,
    getCategoricalVariable,
    (nodes, categoricalVariable) => {
      const groupedList = {};

      nodes.forEach((node) => {
        const categoricalValues = node[entityAttributesProperty][categoricalVariable];

        // Filter out nodes with no value for this variable.
        if (!categoricalValues) { return; }

        categoricalValues.forEach((categoricalValue) => {
          if (groupedList[categoricalValue]) {
            groupedList[categoricalValue].nodes.push(node);
          } else {
            groupedList[categoricalValue] = { group: categoricalValue, nodes: [] };
            groupedList[categoricalValue].nodes.push(node);
          }
        });
      });

      return groupedList;
    },
  );
};

const edgeCoords = (edge, { nodes, layout }) => {
  const from = nodes.find((n) => n[entityPrimaryKeyProperty] === edge.from);
  const to = nodes.find((n) => n[entityPrimaryKeyProperty] === edge.to);

  if (!from || !to) { return { from: null, to: null }; }

  return {
    key: `${edge.from}_${edge.type}_${edge.to}`,
    type: edge.type,
    from: from[entityAttributesProperty][layout],
    to: to[entityAttributesProperty][layout],
  };
};

const edgesToCoords = (edges, { nodes, layout }) => edges.map(
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

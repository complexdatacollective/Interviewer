import {
  first,
  has,
  isArray,
  isNil,
} from 'lodash';
import { entityAttributesProperty, entityPrimaryKeyProperty } from '@codaco/shared-consts';
import { getNetworkNodes, getNetworkEdges } from './network';
import { createDeepEqualSelector } from './utils';
import createSorter from '../utils/createSorter';
import { getEntityAttributes } from '../ducks/modules/network';
import { getStageSubject } from './session';
import { get } from '../utils/lodash-replacements';

const getLayout = (_, props) => get(props, 'prompt.layout.layoutVariable');
const getSortOptions = (_, props) => get(props, 'prompt.sortOrder');
const getDisplayEdges = (_, props) => get(props, 'prompt.edges.display', []);

/**
 * Selector for next unplaced node.
 *
 * requires:
 * { layout, subject, sortOrder, stage } props
 */
export const getNextUnplacedNode = createDeepEqualSelector(
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
    const sorter = createSorter(sortOptions);
    return first(sorter(unplacedNodes));
  },
);

/**
 * Selector for placed nodes.
 *
 * requires:
 * { layout, subject } props
 */
export const getPlacedNodes = createDeepEqualSelector(
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
export const getEdges = createDeepEqualSelector(
  getNetworkEdges,
  getDisplayEdges,
  (edges, displayEdges) => edges.filter(
    (edge) => displayEdges.includes(edge.type),
  ),
);

// Selector for stage nodes
export const getNodes = createDeepEqualSelector(
  getNetworkNodes,
  getStageSubject(), // This is either a subject object or a collection of subject objects
  (nodes, subject) => {
    if (!subject) { return nodes; }

    if (isArray(subject)) {
      const subjects = subject.map((s) => s.type);
      return nodes.filter((node) => subjects.includes(node.type));
    }

    return nodes.filter((node) => node.type === subject.type);
  },
);

import {
  first,
  has,
  isArray,
  isNil,
} from 'lodash';
import { entityAttributesProperty, entityPrimaryKeyProperty } from '@codaco/shared-consts';
import { getNetworkNodes, getNetworkEdges } from './network';
import { createDeepEqualSelector } from './utils';
import createSorter, { processProtocolSortRule } from '../utils/createSorter';
import { getEntityAttributes } from '../ducks/modules/network';
import { getStageSubject } from './session';
import { get } from '../utils/lodash-replacements';
import { getAllVariableUUIDsByEntity } from './protocol';

const getLayout = (_, props) => get(props, 'prompt.layout.layoutVariable');
const getSortOptions = (_, props) => get(props, 'prompt.sortOrder', null);
const getDisplayEdges = (_, props) => get(props, 'prompt.edges.display', []);

/**
 * Selector for next unplaced node.
 *
 * requires:
 * { layout, subject, sortOrder, stage } props
 *
 * Must *ALWAYS* return a node, or null.
 */
export const getNextUnplacedNode = createDeepEqualSelector(
  getNetworkNodes,
  getStageSubject(),
  getLayout,
  getSortOptions,
  getAllVariableUUIDsByEntity,
  (nodes, subject, layoutVariable, sortOptions, codebookVariables) => {
    if (nodes && nodes.length === 0) { return null; }
    if (!subject) { return null; }

    // Stage subject is either a single object or a collection of objects
    const types = isArray(subject) ? subject.map((s) => s.type) : [subject.type];

    // Layout variable is either a string (single stage subject) or an object
    // keyed by node type (two-mode stage subject)
    const layoutVariableForType = (type) => {
      if (typeof layoutVariable === 'string') { return layoutVariable; }
      return layoutVariable[type];
    };

    const unplacedNodes = nodes.filter((node) => {
      const attributes = getEntityAttributes(node);
      return (
        types.includes(node.type)
        && (has(attributes, layoutVariableForType(node.type)))
        && isNil(attributes[layoutVariableForType(node.type)])
      );
    });

    if (unplacedNodes.length === 0) { return undefined; }
    if (!sortOptions) { return first(unplacedNodes); }

    // Protocol sort rules must be processed to be used by createSorter
    const processedSortRules = sortOptions.map(processProtocolSortRule(codebookVariables));
    const sorter = createSorter(processedSortRules);
    return first(sorter(unplacedNodes));
  },
);

/**
 * Selector for placed nodes.
 *
 * requires:
 * { layout, subject } props
 *
 * Must *ALWAYS* return an array, even if empty.
 */
export const getPlacedNodes = createDeepEqualSelector(
  getNetworkNodes,
  getStageSubject(),
  getLayout,
  (nodes, subject, layoutVariable) => {
    if (nodes && nodes.length === 0) { return []; }
    if (!subject) { return []; }

    // Stage subject is either a single object or a collecton of objects
    const types = isArray(subject) ? subject.map((s) => s.type) : [subject.type];

    // Layout variable is either a string or an object keyed by node type
    const layoutVariableForType = (type) => {
      if (typeof layoutVariable === 'string') { return layoutVariable; }
      return layoutVariable[type];
    };

    return nodes.filter((node) => {
      const attributes = getEntityAttributes(node);
      return (
        types.includes(node.type)
        && has(attributes, layoutVariableForType(node.type))
        && !isNil(attributes[layoutVariableForType(node.type)])
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

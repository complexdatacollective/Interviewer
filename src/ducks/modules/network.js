import { reject, findIndex, isMatch, omit } from 'lodash';

import uuidv4 from '../../utils/uuid';

// Property name for the primary key for nodes
export const nodePrimaryKeyProperty = '_uid';

// Property name for node "model" properties
export const nodeAttributesProperty = 'attributes';

export const ADD_NODES = 'ADD_NODES';
export const REMOVE_NODE = 'REMOVE_NODE';
export const UPDATE_NODE = 'UPDATE_NODE';
export const TOGGLE_NODE_ATTRIBUTES = 'TOGGLE_NODE_ATTRIBUTES';
export const ADD_EDGE = 'ADD_EDGE';
export const TOGGLE_EDGE = 'TOGGLE_EDGE';
export const REMOVE_EDGE = 'REMOVE_EDGE';
export const SET_EGO = 'SET_EGO';
export const UNSET_EGO = 'UNSET_EGO';

export const primaryKeyPropertyForWorker = 'networkCanvasId';
export const nodeTypePropertyForWorker = 'networkCanvasType';

// Initial network model structure
const initialState = {
  ego: {},
  nodes: [],
  edges: [],
};

function flipEdge(edge) {
  return { from: edge.to, to: edge.from, type: edge.type };
}

function edgeExists(edges, edge) {
  return (
    findIndex(edges, edge) !== -1 ||
    findIndex(edges, flipEdge(edge)) !== -1
  );
}

/**
 * All generated data is stored inside an 'attributes' property on the node
 */
export const getNodeAttributes = node => node[nodeAttributesProperty] || {};

/**
 * Internally, 'attributes' are stored with UUID keys, which are meaningless to the end user.
 * This resolves those UUIDs to variable names based on the definitions in the variable registry,
 * appropriate for user scripts and export.
 */
const getNodeAttributesWithNamesResolved = (node, nodeVariableDefs) => {
  if (!nodeVariableDefs) {
    return {};
  }
  const attrs = getNodeAttributes(node);
  return Object.keys(attrs).reduce((acc, uuid) => {
    if (nodeVariableDefs[uuid] && nodeVariableDefs[uuid].name) {
      acc[nodeVariableDefs[uuid].name] = attrs[uuid];
    }
    return acc;
  }, {});
};

export const asExportableNode = (node, nodeTypeDefinition) => ({
  ...node,
  attributes: getNodeAttributesWithNamesResolved(node, (nodeTypeDefinition || {}).variables),
});

export const asExportableEdge = (edge, edgeTypeDefinition) => ({
  ...edge,
  type: edgeTypeDefinition && edgeTypeDefinition.name,
});

// Also available as a memoized selector; see selectors/interface
export const asExportableNetwork = (network = {}, registry = {}) => {
  const { nodes = [], edges = [] } = network;
  const { node: nodeRegistry = {}, edge: edgeRegistry = {} } = registry;
  return ({
    nodes: nodes.map(node => asExportableNode(node, nodeRegistry[node.type])),
    edges: edges.map(edge => asExportableEdge(edge, edgeRegistry[edge.type])),
  });
};

/**
 * Given a variable name ("age") and the relevant section of the variable registry, returns the
 * ID/key for that name.
 */
const getVariableIdFromName = (variableName, variableDefs) => {
  const entry = Object.entries(variableDefs).find(([, variable]) => variable.name === variableName);
  return entry && entry[0];
};

/**
 * The inverse of getNodeAttributesWithNamesResolved
 */
export const getNodeWithIdAttributes = (node, nodeVariableDefs) => {
  if (!nodeVariableDefs) {
    return {};
  }
  const attrs = getNodeAttributes(node);
  const mappedAttrs = Object.keys(attrs).reduce((acc, varName) => {
    const variableId = getVariableIdFromName(varName, nodeVariableDefs);
    if (variableId) {
      acc[variableId] = attrs[varName];
    }
    return acc;
  }, {});

  return {
    ...node,
    [nodeAttributesProperty]: mappedAttrs,
  };
};

/**
 * Contains all user attributes flattened with the node's unique ID.
 *
 *`primaryKeyPropertyForWorker` and `nodeTypePropertyForWorker` are used to minimize conflicts,
 * but user data is always preserved in the event of conflicts.
 *
 * @param  {Object} node
 * @param  {Object} nodeTypeDefinition The variableRegistry entry for this node type
 * @return {Object} node data safe to supply to user-defined workers.
 */
export const asWorkerAgentNode = (node, nodeTypeDefinition) => ({
  [primaryKeyPropertyForWorker]: node[nodePrimaryKeyProperty],
  [nodeTypePropertyForWorker]: nodeTypeDefinition && nodeTypeDefinition.name,
  ...getNodeAttributesWithNamesResolved(node, (nodeTypeDefinition || {}).variables),
});

export const asWorkerAgentEdge = asExportableEdge;

// Also available as a memoized selector; see selectors/interface
export const asWorkerAgentNetwork = (network = {}, registry = {}) => {
  const { nodes = [], edges = [] } = network;
  const { node: nodeRegistry = {}, edge: edgeRegistry = {} } = registry;
  return ({
    nodes: nodes.map(node => asWorkerAgentNode(node, nodeRegistry[node.type])),
    edges: edges.map(edge => asWorkerAgentEdge(edge, edgeRegistry[edge.type])),
  });
};

/**
 * existingNodes - Existing network.nodes
 * netNodes - nodes to be added to the network
 * additionalProperties - static props shared to add to each member of newNodes
*/
function getNodesWithBatchAdd(existingNodes, newNodes, additionalProperties = {}) {
  // Create a function to create a UUID and merge node attributes
  const withModelandAttributeData = newNode => ({
    ...additionalProperties,
    [nodePrimaryKeyProperty]: uuidv4(),
    ...newNode, // second to prevent overwriting existing node UUID (e.g., assigned to externalData)
    [nodeAttributesProperty]: {
      ...additionalProperties[nodeAttributesProperty],
      ...newNode[nodeAttributesProperty],
    },
  });

  return existingNodes.concat(newNodes.map(withModelandAttributeData));
}

/**
 * @param {Array} nodes - the current state.nodes
 * @param {Object} updatingNode - the node to be updated. Will match on _uid.
 * @param {Object} nodeAttributeData - additional attributes to update the node with.
 *                                   If null, then the updatingNode's `attributes` property
 *                                   will overwrite the original node's. Use this to perform
 *                                   a 'full' update, but ensure the entire updated node is
 *                                   passed as `updatingNode`.
 */
function getUpdatedNodes(nodes, updatingNode, nodeAttributeData = null) {
  return nodes.map((node) => {
    if (node[nodePrimaryKeyProperty] !== updatingNode[nodePrimaryKeyProperty]) { return node; }

    const updatedNode = {
      ...node,
      ...updatingNode,
      [nodePrimaryKeyProperty]: node[nodePrimaryKeyProperty],
    };

    if (nodeAttributeData) {
      updatedNode[nodeAttributesProperty] = {
        ...node[nodeAttributesProperty],
        ...updatingNode[nodeAttributesProperty],
        ...nodeAttributeData,
      };
    }

    return updatedNode;
  });
}

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case ADD_NODES: {
      return {
        ...state,
        nodes: getNodesWithBatchAdd(state.nodes, action.nodes, action.additionalProperties),
      };
    }
    /**
     * TOGGLE_NODE_ATTRIBUTES
     */
    case TOGGLE_NODE_ATTRIBUTES: {
      const updatedNodes = state.nodes.map((node) => {
        if (node[nodePrimaryKeyProperty] !== action[nodePrimaryKeyProperty]) {
          return node;
        }

        // If the node's attrs contain the same key/vals, remove them
        if (isMatch(node[nodeAttributesProperty], action.attributes)) {
          const omittedKeys = Object.keys(action.attributes);
          const nestedProps = omittedKeys.map(key => `${nodeAttributesProperty}.${key}`);
          return omit(node, nestedProps);
        }

        // Otherwise, add/update
        return {
          ...node,
          [nodeAttributesProperty]: {
            ...node[nodeAttributesProperty],
            ...action.attributes,
          },
        };
      });

      return {
        ...state,
        nodes: updatedNodes,
      };
    }
    case UPDATE_NODE: {
      return {
        ...state,
        nodes: getUpdatedNodes(state.nodes, action.node, action.additionalProperties),
      };
    }
    case REMOVE_NODE: {
      const removenodePrimaryKeyProperty = action[nodePrimaryKeyProperty];
      return {
        ...state,
        nodes: reject(state.nodes, node =>
          node[nodePrimaryKeyProperty] === removenodePrimaryKeyProperty),
        edges: reject(state.edges, edge =>
          edge.from === removenodePrimaryKeyProperty || edge.to === removenodePrimaryKeyProperty),
      };
    }
    case ADD_EDGE:
      if (edgeExists(state.edges, action.edge)) { return state; }
      return {
        ...state,
        edges: [...state.edges, action.edge],
      };
    case TOGGLE_EDGE:
      // remove edge if it exists, add it if it doesn't
      if (edgeExists(state.edges, action.edge)) {
        return {
          ...state,
          edges: reject(reject(state.edges, action.edge), flipEdge(action.edge)),
        };
      }
      return {
        ...state,
        edges: [...state.edges, action.edge],
      };
    case REMOVE_EDGE:
      if (edgeExists(state.edges, action.edge)) {
        return {
          ...state,
          edges: reject(reject(state.edges, action.edge), flipEdge(action.edge)),
        };
      }
      return state;
    default:
      return state;
  }
}

/**
 * @namespace NetworkActionCreators
 */
const actionCreators = {};

const actionTypes = {
  ADD_NODES,
  UPDATE_NODE,
  TOGGLE_NODE_ATTRIBUTES,
  REMOVE_NODE,
  ADD_EDGE,
  TOGGLE_EDGE,
  REMOVE_EDGE,
  SET_EGO,
  UNSET_EGO,
};

export {
  actionCreators,
  actionTypes,
};

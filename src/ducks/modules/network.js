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

export const getNodeAttributes = node => node[nodeAttributesProperty] || {};

export const getNodeWithoutAttributes = node => omit(node, nodeAttributesProperty);

/**
 * existingNodes - Existing network.nodes
 * netNodes - nodes to be added to the network
 * additionalAttributes - node model properties
*/
function getNodesWithBatchAdd(existingNodes, newNodes, nodeAttributeData) {
  // Create a function to create a UUID and merge node attributes
  const withModelandAttributeData = newNode => ({
    [nodePrimaryKeyProperty]: uuidv4(),
    ...newNode, // second to allow existing UUID to be overwritten
    [nodeAttributesProperty]: {
      ...newNode[nodeAttributesProperty],
      ...nodeAttributeData,
    },
  });

  return existingNodes.concat(newNodes.map(withModelandAttributeData));
}

/**
 * @param {array} nodes - an array of objects representing nodes
 * @param {object} updatedNode - object representing the node to be updated and its new properties
 */
function getUpdatedNodes(nodes, updatedNode, nodeAttributeData) {
  // Iterate over the nodes list
  const updatedNodes = nodes.map((node) => {
    // Skip nodes where the primary key doesn't match
    if (node[nodePrimaryKeyProperty] !== updatedNode[nodePrimaryKeyProperty]) { return node; }
    // if we have an attributes payload, merge with any existing attributes
    if (nodeAttributeData) {
      return {
        ...node,
        ...updatedNode,
        [nodeAttributesProperty]: {
          ...node[nodeAttributesProperty],
          ...nodeAttributeData,
        },
        [nodePrimaryKeyProperty]: node[nodePrimaryKeyProperty],
      };
    }

    // If no attribute payload, just merge the new node data with the existing
    return {
      ...node,
      ...updatedNode,
      [nodePrimaryKeyProperty]: node[nodePrimaryKeyProperty],
    };
  });

  // Return the modified array of nodes
  return updatedNodes;
}

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case ADD_NODES: {
      return {
        ...state,
        nodes: getNodesWithBatchAdd(state.nodes, action.nodes, action.additionalAttributes),
      };
    }
    /**
     * TOGGLE_NODE_ATTRIBUTES
     */
    case TOGGLE_NODE_ATTRIBUTES: {
      // attributes = object containing the attributes to remove, minus _uid
      const attributesToToggle = omit(action.attributes, [nodePrimaryKeyProperty]);
      // Map over the nodes
      const updatedNodes = state.nodes.map((node) => {
        // Skip nodes with different primary keys
        if (node[nodePrimaryKeyProperty] !== action[nodePrimaryKeyProperty]) { return node; }

        // When we find the node that matches the primary key, toggle the properties
        if (isMatch(node[nodeAttributesProperty], attributesToToggle)) {
          // Object.assign is much slower than the following safe mutation
          // eslint-disable-next-line no-param-reassign
          node[nodeAttributesProperty] =
            omit(
              node[nodeAttributesProperty],
              Object.getOwnPropertyNames(attributesToToggle),
            );
          return node;
        }

        return {
          ...node,
          ...action.attributes,
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
        nodes: getUpdatedNodes(state.nodes, action.node, action.additionalAttributes),
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

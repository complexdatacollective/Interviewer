import { reject, findIndex, isMatch, omit, merge, concat, pull, keys } from 'lodash';

import uuidv4 from '../../utils/uuid';

// Property name for the primary key for nodes
export const nodePrimaryKeyProperty = '_uid';

// Property name for node "model" properties
export const nodeAttributesProperty = 'attributes';

// Property names passed to user worker scripts
export const primaryKeyPropertyForWorker = 'networkCanvasId';
export const nodeTypePropertyForWorker = 'networkCanvasType';

export const ADD_NODE = 'ADD_NODE';
export const ADD_NODES = 'ADD_NODES';
export const REMOVE_NODE = 'REMOVE_NODE';
export const REMOVE_NODE_FROM_PROMPT = 'REMOVE_NODE_FROM_PROMPT';
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

/**
 * All generated data is stored inside an 'attributes' property on the node
 */
export const getNodeAttributes = node => node[nodeAttributesProperty] || {};

/**
 * existingNodes - Existing network.nodes
 * newNodes - nodes to be added to the network
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
 * existingNodes - Existing network.nodes
 * modelData
 * attributeData
*/
function getNewNodeList(existingNodes, modelData, attributeData) {
  const {
    itemType,
    type,
    promptId,
    stageId,
  } = modelData;

  const withModelandAttributeData = {
    [nodePrimaryKeyProperty]:
      modelData[nodePrimaryKeyProperty] ? modelData[nodePrimaryKeyProperty] : uuidv4(),
    [nodeAttributesProperty]: attributeData,
    promptIDs: [promptId],
    stageId,
    type,
    itemType,
  };

  return existingNodes.concat(withModelandAttributeData);
}


/**
 * @param {Array} existingNodes - the current state.nodes
 * @param {Object} nodeID - the node to be updated. Will match on _uid.
 * @param {Object} newModelData -
 * @param {Object} newAttributeData - additional attributes to update the node with.
 *                                   If null, then the updatingNode's `attributes` property
 *                                   will overwrite the original node's. Use this to perform
 *                                   a 'full' update, but ensure the entire updated node is
 *                                   passed as `updatingNode`.
 */
function getUpdatedNodes(existingNodes, nodeID, newModelData, newAttributeData) {
  return existingNodes.map((node) => {
    if (node[nodePrimaryKeyProperty] !== nodeID) { return node; }
    return {
      ...node,
      ...omit(newModelData, 'promptId'),
      promptIDs: concat(node.promptIDs, newModelData.promptId),
      [nodeAttributesProperty]: merge(node[nodeAttributesProperty], newAttributeData),
    };
  });
}

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    /**
     * Add single node using new syntax (modelData, attributeData)
    */
    case ADD_NODE: {
      return {
        ...state,
        nodes: getNewNodeList(state.nodes, action.modelData, action.attributeData),
      };
    }
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
        nodes: getUpdatedNodes(
          state.nodes,
          action.nodeID,
          action.newModelData,
          action.newAttributeData,
        ),
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
    case REMOVE_NODE_FROM_PROMPT: {
      const getActionedNodeList = (existingNodes, nodeId, promptId, promptAttributes) =>
        existingNodes.map(
          (node) => {
            if (node[nodePrimaryKeyProperty] !== nodeId) {
              return node;
            }

            return {
              ...node,
              [nodeAttributesProperty]: omit(node[nodeAttributesProperty], keys(promptAttributes)),
              promptIDs: pull(node.promptIDs, promptId),
            };
          });

      return {
        ...state,
        nodes: getActionedNodeList(
          state.nodes,
          action.nodeId,
          action.promptId,
          action.promptAttributes,
        ),
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

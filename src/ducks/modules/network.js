import { reject, findIndex, isMatch, omit, keys } from 'lodash';

import uuidv4 from '../../utils/uuid';

// Property name for the primary key for nodes
export const nodePrimaryKeyProperty = '_uid';

// Property name for node "model" properties
export const nodeAttributesProperty = 'attributes';

// Property names passed to user worker scripts
export const primaryKeyPropertyForWorker = 'networkCanvasId';
export const nodeTypePropertyForWorker = 'networkCanvasType';

export const ADD_NODE = 'ADD_NODE';
export const BATCH_ADD_NODES = 'BATCH_ADD_NODES';
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

export const getNodeAttributes = node => node[nodeAttributesProperty] || {};

/**
 * This function generates default values for all variables in the variable registry for this node
 * type.
 *
 * @param {object} registryForType - An object containing the variable registry entry for this
 *                                   node type.
 */

const getDefaultAttributesForNodeType = (registryForType) => {
  const defaultAttributesObject = {};

  // Boolean variables are initialised as `false`, and everything else as `null`
  Object.keys(registryForType).forEach((key) => {
    defaultAttributesObject[key] = registryForType[key].type === 'boolean' ? false : null;
  });

  return defaultAttributesObject;
};


const nodeWithModelandAttributeData = (modelData, attributeData, defaultAttributeData = {}) => ({
  ...omit(modelData, 'promptId'),
  [nodePrimaryKeyProperty]:
    modelData[nodePrimaryKeyProperty] ? modelData[nodePrimaryKeyProperty] : uuidv4(),
  [nodeAttributesProperty]: {
    ...getDefaultAttributesForNodeType(defaultAttributeData),
    ...modelData[nodeAttributesProperty],
    ...attributeData,
  },
  promptIDs: [modelData.promptId],
  stageId: modelData.stageId,
  type: modelData.type,
  itemType: modelData.itemType,
});

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case ADD_NODE: {
      return {
        ...state,
        nodes: (
          () => state.nodes.concat(
            nodeWithModelandAttributeData(
              action.modelData,
              action.attributeData,
              action.registryForType,
            ),
          )
        )(),
      };
    }
    case BATCH_ADD_NODES: {
      return {
        ...state,
        nodes: (() =>
          state.nodes.concat(action.nodeList.map(node => nodeWithModelandAttributeData(
            node,
            action.attributeData,
            action.registryForTypes[node.type],
          )))
        )(),
      };
    }
    case TOGGLE_NODE_ATTRIBUTES: {
      return {
        ...state,
        nodes: (
          () => state.nodes.map(
            (node) => {
              if (node[nodePrimaryKeyProperty] !== action[nodePrimaryKeyProperty]) { return node; }

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
            }, // end node map function
          )
        )(),
      };
    }
    case UPDATE_NODE: {
      return {
        ...state,
        nodes: (() => state.nodes.map((node) => {
          if (node[nodePrimaryKeyProperty] !== action.nodeId) { return node; }
          return {
            ...node,
            ...omit(action.newModelData, 'promptId'),
            promptIDs: action.newModelData.promptId ?
              [...node.promptIDs, action.newModelData.promptId] : node.promptIDs,
            [nodeAttributesProperty]: {
              ...node[nodeAttributesProperty],
              ...action.newAttributeData,
            },
          };
        })
        )(),
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
      return {
        ...state,
        nodes: (() => state.nodes.map(
          (node) => {
            if (node[nodePrimaryKeyProperty] !== action.nodeId) { return node; }
            return {
              ...node,
              [nodeAttributesProperty]:
                omit(node[nodeAttributesProperty], keys(action.promptAttributes)),
              promptIDs: node.promptIDs.filter(id => id !== action.promptId),
            };
          })
        )(),
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
  ADD_NODE,
  BATCH_ADD_NODES,
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

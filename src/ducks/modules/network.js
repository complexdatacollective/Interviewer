import { reject, find, isMatch, omit, keys, get } from 'lodash';

import uuidv4 from '../../utils/uuid';

// Property name for the primary key for nodes or edged
export const entityPrimaryKeyProperty = '_uid';

// Property name for node or edge model properties
export const entityAttributesProperty = 'attributes';

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

function edgeExists(edges, from, to, type) {
  const forwardsEdge = find(edges, { from, to, type });
  const reverseEdge = find(edges, flipEdge({ from, to, type }));

  if ((forwardsEdge && forwardsEdge !== -1) || (reverseEdge && reverseEdge !== -1)) {
    const foundEdge = forwardsEdge || reverseEdge;
    return get(foundEdge, entityPrimaryKeyProperty);
  }

  return false;
}

export const getEntityAttributes = node => node[entityAttributesProperty] || {};

const nodeWithModelandAttributeData = (modelData, attributeData) => ({
  ...omit(modelData, 'promptId'),
  [entityPrimaryKeyProperty]:
    modelData[entityPrimaryKeyProperty] ? modelData[entityPrimaryKeyProperty] : uuidv4(),
  [entityAttributesProperty]: {
    ...modelData[entityAttributesProperty],
    ...attributeData,
  },
  promptIDs: [modelData.promptId],
  stageId: modelData.stageId,
  type: modelData.type,
  itemType: modelData.itemType,
});

const edgeWithModelandAttributeData = (modelData, attributeData) => ({
  ...modelData,
  [entityPrimaryKeyProperty]:
    modelData[entityPrimaryKeyProperty] ? modelData[entityPrimaryKeyProperty] : uuidv4(),
  [entityAttributesProperty]: {
    ...modelData[entityAttributesProperty],
    ...attributeData,
  },
  type: modelData.type,
  itemType: modelData.itemType,
});

const addEdge = (state, action) => ({
  ...state,
  edges: (
    () => state.edges.concat(
      edgeWithModelandAttributeData(
        action.modelData,
        action.attributeData,
      ),
    )
  )(),
});

const removeEdge = (state, edgeId) => ({
  ...state,
  edges: reject(state.edges, edge =>
    edge[entityPrimaryKeyProperty] === edgeId,
  ),
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
              if (node[entityPrimaryKeyProperty] !== action[entityPrimaryKeyProperty]) {
                return node;
              }

              // If the node's attrs contain the same key/vals, remove them
              if (isMatch(node[entityAttributesProperty], action.attributes)) {
                const omittedKeys = Object.keys(action.attributes);
                const nestedProps = omittedKeys.map(key => `${entityAttributesProperty}.${key}`);
                return omit(node, nestedProps);
              }

              // Otherwise, add/update
              return {
                ...node,
                [entityAttributesProperty]: {
                  ...node[entityAttributesProperty],
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
          if (node[entityPrimaryKeyProperty] !== action.nodeId) { return node; }
          return {
            ...node,
            ...omit(action.newModelData, 'promptId'),
            promptIDs: action.newModelData.promptId ?
              [...node.promptIDs, action.newModelData.promptId] : node.promptIDs,
            [entityAttributesProperty]: {
              ...node[entityAttributesProperty],
              ...action.newAttributeData,
            },
          };
        })
        )(),
      };
    }
    case REMOVE_NODE: {
      const removeentityPrimaryKeyProperty = action[entityPrimaryKeyProperty];
      return {
        ...state,
        nodes: reject(state.nodes, node =>
          node[entityPrimaryKeyProperty] === removeentityPrimaryKeyProperty),
        edges: reject(state.edges, edge =>
          edge.from === removeentityPrimaryKeyProperty ||
          edge.to === removeentityPrimaryKeyProperty),
      };
    }
    case REMOVE_NODE_FROM_PROMPT: {
      return {
        ...state,
        nodes: (() => state.nodes.map(
          (node) => {
            if (node[entityPrimaryKeyProperty] !== action.nodeId) { return node; }
            return {
              ...node,
              [entityAttributesProperty]:
                omit(node[entityAttributesProperty], keys(action.promptAttributes)),
              promptIDs: node.promptIDs.filter(id => id !== action.promptId),
            };
          })
        )(),
      };
    }
    case ADD_EDGE: {
      return addEdge(state, action);
    }
    case TOGGLE_EDGE: {
      // remove edge if it exists, add it if it doesn't
      const { to, from, type } = action.modelData;
      if (!to || !from || !type) { return state; }
      const existingEdgeId = edgeExists(state.edges, from, to, type);

      if (existingEdgeId) {
        // Edge exists - remove it
        return removeEdge(state, existingEdgeId);
      }

      // Edge does not exist - create it
      return addEdge(state, action);
    }
    case REMOVE_EDGE:
      return removeEdge(state, action.edgeId);
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

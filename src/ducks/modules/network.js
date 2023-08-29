import { entityAttributesProperty, entityPrimaryKeyProperty } from '@codaco/shared-consts';
import {
  reject, find, isMatch, omit, keys, get,
} from 'lodash';
import uuid from 'uuid/v4';

/*
 * For actionCreators see `src/ducks/modules/sessions`
 */

// Property names passed to user worker scripts
export const primaryKeyPropertyForWorker = 'networkCanvasId';
export const nodeTypePropertyForWorker = 'networkCanvasType';

const ADD_NODE = 'ADD_NODE';
const ADD_NODE_TO_PROMPT = 'ADD_NODE_TO_PROMPT';
const BATCH_ADD_NODES = 'BATCH_ADD_NODES';
const REMOVE_NODE = 'REMOVE_NODE';
const REMOVE_NODE_FROM_PROMPT = 'REMOVE_NODE_FROM_PROMPT';
const UPDATE_NODE = 'UPDATE_NODE';
const TOGGLE_NODE_ATTRIBUTES = 'TOGGLE_NODE_ATTRIBUTES';
const ADD_EDGE = 'ADD_EDGE';
const UPDATE_EDGE = 'UPDATE_EDGE';
const TOGGLE_EDGE = 'TOGGLE_EDGE';
const REMOVE_EDGE = 'REMOVE_EDGE';
const UPDATE_EGO = 'UPDATE_EGO';
const ADD_SESSION = 'ADD_SESSION';

// Initial network model structure
const getInitialState = () => ({
  ego: {
    [entityPrimaryKeyProperty]: uuid(),
    [entityAttributesProperty]: {},
  },
  nodes: [],
  edges: [],
});

// action creators

/**
 * Action creator to add a list of nodes
 * @param nodeList If nodes have attributes they are applied before attributeData
 * and after defaultAttributes
 * @param attributeData Takes precidence over other attributes
 * @param defaultAttributes Is added before other attributes
 */
const batchAddNodes = (nodeList, attributeData = {}, defaultAttributes = {}) => ({
  type: BATCH_ADD_NODES,
  nodeList,
  defaultAttributes,
  attributeData,
});

// reducer helpers:

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

export const getEntityAttributes = (node) => node[entityAttributesProperty] || {};

/**
 * Correctly construct the node object based on a
 * node-like object, and an key-value attributes object
 */
const formatNodeAttributes = (modelData, attributeData) => ({
  ...omit(modelData, 'promptId'),
  [entityPrimaryKeyProperty]:
    modelData[entityPrimaryKeyProperty] || uuid(),
  [entityAttributesProperty]: {
    ...modelData[entityAttributesProperty],
    ...attributeData,
  },
  promptIDs: [modelData.promptId],
  stageId: modelData.stageId,
  type: modelData.type,
  itemType: modelData.itemType,
});

const formatEgoAttributes = (modelData, attributeData) => ({
  ...modelData,
  [entityAttributesProperty]: {
    ...attributeData,
  },
});

/**
 * Correctly construct the edge object based on a
 * edge-like object, and an key-value attributes object
 */
const formatEdgeAttributes = (modelData, attributeData) => ({
  ...modelData,
  [entityPrimaryKeyProperty]:
    modelData[entityPrimaryKeyProperty] || uuid(),
  [entityAttributesProperty]: {
    ...modelData[entityAttributesProperty],
    ...attributeData,
  },
  type: modelData.type,
});

const addEdge = (state, action) => ({
  ...state,
  edges: (
    () => state.edges.concat(
      formatEdgeAttributes(
        action.modelData,
        action.attributeData,
      ),
    )
  )(),
});

const removeEdge = (state, edgeId) => ({
  ...state,
  edges: reject(state.edges, (edge) => edge[entityPrimaryKeyProperty] === edgeId),
});

export default function reducer(state = getInitialState(), action = {}) {
  switch (action.type) {
    case ADD_NODE: {
      return {
        ...state,
        nodes: [
          ...state.nodes,
          formatNodeAttributes(
            action.modelData,
            action.attributeData,
          ),
        ],
      };
    }
    case UPDATE_EGO: {
      return {
        ...state,
        ego: {
          ...state.ego,
          ...action.modelData,
          [entityAttributesProperty]: {
            ...state.ego[entityAttributesProperty],
            ...action.attributeData,
          },
        },
      };
    }
    case BATCH_ADD_NODES: {
      // TODO: This mutation should happen in the action creator
      // or potentially be moved to the action caller
      return {
        ...state,
        nodes: [
          ...state.nodes,
          ...action.nodeList.map((node) => {
            const attributes = {
              ...action.defaultAttributes,
              ...node[entityAttributesProperty],
              ...action.attributeData,
            };

            return formatNodeAttributes(node, attributes);
          }),
        ],
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
                const nestedProps = omittedKeys.map((key) => `${entityAttributesProperty}.${key}`);
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
            promptIDs: action.newModelData.promptId
              ? [...node.promptIDs, action.newModelData.promptId] : node.promptIDs,
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
        nodes: reject(
          state.nodes,
          (node) => node[entityPrimaryKeyProperty] === removeentityPrimaryKeyProperty,
        ),
        edges: reject(
          state.edges,
          (edge) => (
            edge.from === removeentityPrimaryKeyProperty
            || edge.to === removeentityPrimaryKeyProperty
          ),
        ),
      };
    }
    case ADD_NODE_TO_PROMPT: {
      return {
        ...state,
        nodes: (() => state.nodes.map(
          (node) => {
            if (node[entityPrimaryKeyProperty] !== action.nodeId) { return node; }
            return {
              ...node,
              [entityAttributesProperty]:
                { ...node[entityAttributesProperty], ...action.promptAttributes },
              promptIDs: [...node.promptIDs, action.promptId],
            };
          },
        )
        )(),
      };
    }
    case REMOVE_NODE_FROM_PROMPT: {
      const togglePromptAttributes = keys(action.promptAttributes)
        .reduce(
          (attributes, attrKey) => ({
            ...attributes,
            [attrKey]: !action.promptAttributes[attrKey],
          }),
          {},
        );
      return {
        ...state,
        nodes: (() => state.nodes.map(
          (node) => {
            if (node[entityPrimaryKeyProperty] !== action.nodeId) { return node; }
            return {
              ...node,
              [entityAttributesProperty]:
                { ...node[entityAttributesProperty], ...togglePromptAttributes },
              promptIDs: node.promptIDs.filter((id) => id !== action.promptId),
            };
          },
        )
        )(),
      };
    }
    case ADD_EDGE: {
      return addEdge(state, action);
    }
    case UPDATE_EDGE: {
      return {
        ...state,
        edges: (() => state.edges.map((edge) => {
          if (edge[entityPrimaryKeyProperty] !== action.edgeId) { return edge; }
          return {
            ...edge,
            ...action.newModelData,
            [entityAttributesProperty]: {
              ...edge[entityAttributesProperty],
              ...action.newAttributeData,
            },
          };
        })
        )(),
      };
    }
    case TOGGLE_EDGE: {
      // remove edge if it exists, add it if it doesn't
      const { to, from, type } = action.modelData;
      if (!to || !from || !type) { return state; }

      // Returns an edge UID if an existing edge is found, otherwise false;
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
    case ADD_SESSION: {
      const initialState = getInitialState();

      return {
        ...initialState,
        ego: formatEgoAttributes(
          initialState.ego,
          action.egoAttributeData,
        ),
      };
    }
    default:
      return state;
  }
}

const actionTypes = {
  ADD_NODE,
  ADD_NODE_TO_PROMPT,
  BATCH_ADD_NODES,
  UPDATE_NODE,
  TOGGLE_NODE_ATTRIBUTES,
  REMOVE_NODE,
  REMOVE_NODE_FROM_PROMPT,
  ADD_EDGE,
  UPDATE_EDGE,
  TOGGLE_EDGE,
  REMOVE_EDGE,
  UPDATE_EGO,
};

const actionCreators = {
  batchAddNodes,
};

export {
  actionTypes,
  actionCreators,
  // For actionCreators see `src/ducks/modules/sessions`
};

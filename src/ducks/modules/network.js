import { reject, findIndex, isMatch, omit } from 'lodash';

import uuidv4 from '../../utils/uuid';

// Primary key used on node data
export const NodePrimaryKeyProperty = '_uid';

export const ADD_NODES = 'ADD_NODES';
export const REMOVE_NODE = 'REMOVE_NODE';
export const UPDATE_NODE = 'UPDATE_NODE';
export const TOGGLE_NODE_ATTRIBUTES = 'TOGGLE_NODE_ATTRIBUTES';
export const ADD_EDGE = 'ADD_EDGE';
export const TOGGLE_EDGE = 'TOGGLE_EDGE';
export const REMOVE_EDGE = 'REMOVE_EDGE';
export const SET_EGO = 'SET_EGO';
export const UNSET_EGO = 'UNSET_EGO';

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

// Generates test alters for development,
function getNodesWithBatchAdd(oldNodes, newNodes, additionalAttributes) {
  const withAttrs = newNode =>
    ({ ...additionalAttributes, [NodePrimaryKeyProperty]: uuidv4(), ...newNode });
  return oldNodes.concat(newNodes.map(withAttrs));
}


function getUpdatedNodes(nodes, updatedNode, full) {
  const updatedNodes = nodes.map((node) => {
    if (node[NodePrimaryKeyProperty] !== updatedNode[NodePrimaryKeyProperty]) { return node; }

    if (full) {
      return {
        ...updatedNode,
        [NodePrimaryKeyProperty]: node[NodePrimaryKeyProperty],
      };
    }

    return {
      ...node,
      ...updatedNode,
      [NodePrimaryKeyProperty]: node[NodePrimaryKeyProperty],
    };
  });
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
    case TOGGLE_NODE_ATTRIBUTES: {
      const attributes = omit(action.attributes, [NodePrimaryKeyProperty]);

      const updatedNodes = state.nodes.map((node) => {
        if (node[NodePrimaryKeyProperty] !== action[NodePrimaryKeyProperty]) { return node; }

        if (isMatch(node, attributes)) {
          return omit(node, Object.getOwnPropertyNames(attributes));
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
        nodes: getUpdatedNodes(state.nodes, action.node, action.full),
      };
    }
    case REMOVE_NODE: {
      const removeNodePrimaryKeyProperty = action[NodePrimaryKeyProperty];
      return {
        ...state,
        nodes: reject(state.nodes, node =>
          node[NodePrimaryKeyProperty] === removeNodePrimaryKeyProperty),
        edges: reject(state.edges, edge =>
          edge.from === removeNodePrimaryKeyProperty || edge.to === removeNodePrimaryKeyProperty),
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

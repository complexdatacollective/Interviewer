import { maxBy, reject, findIndex, isMatch, omit } from 'lodash';

const ADD_NODE = 'ADD_NODE';
const REMOVE_NODE = 'REMOVE_NODE';
const UPDATE_NODE = 'UPDATE_NODE';
const TOGGLE_NODE_ATTRIBUTES = 'TOGGLE_NODE_ATTRIBUTES';
const ADD_EDGE = 'ADD_EDGE';
const TOGGLE_EDGE = 'TOGGLE_EDGE';
const REMOVE_EDGE = 'REMOVE_EDGE';
const SET_EGO = 'SET_EGO';
const UNSET_EGO = 'UNSET_EGO';

const initialState = {
  ego: {},
  nodes: [],
  edges: [],
};

// We use these internally to uniquely identify nodes accross previous data / network data
function nextUid(nodes) {
  return `${Date.now()}_${nodes.length + 1}`;
}

// We use these internally to uniquely identify nodes accross network data only
// (previous data is immutable)
function nextId(nodes) {
  if (nodes.length === 0) { return 1; }
  return maxBy(nodes, 'id').id + 1;
}

function flipEdge(edge) {
  return { from: edge.to, to: edge.from, type: edge.type };
}

function edgeExists(edges, edge) {
  return (
    findIndex(edges, edge) !== -1 ||
    findIndex(edges, flipEdge(edge)) !== -1
  );
}

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case ADD_NODE: {
      const id = nextId(state.nodes);
      const uid = nextUid(state.nodes);
      // Provided uid can override generated one, but not id
      const node = { uid, ...action.node, id };
      return {
        ...state,
        nodes: [...state.nodes, node],
      };
    }
    case TOGGLE_NODE_ATTRIBUTES: {
      const attributes = omit(action.attributes, ['uid', 'id']);

      const updatedNodes = state.nodes.map((node) => {
        if (node.uid !== action.node.uid) { return node; }

        if (isMatch(node, attributes)) {
          return omit(node, Object.getOwnPropertyNames(attributes));
        }

        return {
          ...node,
          ...action.attributes,
          id: node.id,
          uid: node.uid,
        };
      });

      return {
        ...state,
        nodes: updatedNodes,
      };
    }
    case UPDATE_NODE: {
      const updatedNodes = state.nodes.map((node) => {
        if (node.uid !== action.node.uid) { return node; }

        return {
          ...node,
          ...action.node,
          id: node.id,
          uid: node.uid,
        };
      });

      return {
        ...state,
        nodes: updatedNodes,
      };
    }
    case REMOVE_NODE:
      // TODO: Shouldn't this use node.id?
      return {
        ...state,
        nodes: reject(state.nodes, node => node.uid === action.uid),
      };
    case ADD_EDGE:
      if (edgeExists(state.edges, action.edge)) { return state; }
      return {
        ...state,
        edges: [...state.edges, action.edge],
      };
    case TOGGLE_EDGE:
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

function addNode(node) {
  return {
    type: ADD_NODE,
    node,
  };
}

function updateNode(node) {
  return {
    type: UPDATE_NODE,
    node,
  };
}

function toggleNodeAttributes(node, attributes) {
  return {
    type: TOGGLE_NODE_ATTRIBUTES,
    node,
    attributes,
  };
}

function removeNode(uid) {
  return {
    type: REMOVE_NODE,
    uid,
  };
}

function addEdge(edge) {
  return {
    type: ADD_EDGE,
    edge,
  };
}

function toggleEdge(edge) {
  return {
    type: TOGGLE_EDGE,
    edge,
  };
}

function removeEdge(edge) {
  return {
    type: REMOVE_EDGE,
    edge,
  };
}

const actionCreators = {
  addNode,
  updateNode,
  removeNode,
  addEdge,
  toggleEdge,
  removeEdge,
  toggleNodeAttributes,
};

const actionTypes = {
  ADD_NODE,
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

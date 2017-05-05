import _ from 'lodash';

const SET_ACTIVE_NODE_ATTRIBUTES = 'SET_ACTIVE_NODE_ATTRIBUTES';
const ADD_NODE = 'ADD_NODE';
const REMOVE_NODE = 'REMOVE_NODE';
const UPDATE_NODE = 'UPDATE_NODE';
const ADD_EDGE = 'ADD_EDGE';
const REMOVE_EDGE = 'REMOVE_EDGE';
const SET_EGO = 'SET_EGO';
const UNSET_EGO = 'UNSET_EGO';

const initialState = {
  ego: {},
  nodes: [],
  edges: []
};

function nextUid(nodes) {
  return `${Date.now()}_${nodes.length + 1}`;
}

function nextId(nodes) {
  return _.sortBy(nodes, ['id']).last + 1;
}

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case ADD_NODE:
      const id = nextId(state.nodes);
      const uid = nextUid(state.nodes);
      const node = { uid, ...action.node, id }  // Provided uid can override generated one, but not id
      return {
        ...state,
        nodes: [...state.nodes, node]
      }
    case UPDATE_NODE:
      const nodes = [ ...state.nodes ];
      const nodeIndex = _.findIndex(state.nodes, ['uid', action.node.uid]);
      nodes[nodeIndex] = { ...action.node, id: nodes[nodeIndex].id };  // id can't be altered
      return {
        ...state,
        nodes: [...nodes ]
      }
    case REMOVE_NODE:
      return {
        ...state,
        nodes: _.reject(state.nodes, (node) => node.uid === action.uid)
      }
    case SET_ACTIVE_NODE_ATTRIBUTES:
      return {
        ...state,
        activeNodeAttributes: action.attributes,
      }
    default:
      return state;
  }
};

function addNode(node) {
  return {
    type: ADD_NODE,
    node
  }
}

function updateNode(node) {
  return {
    type: UPDATE_NODE,
    node,
  }
}

function removeNode(uid) {
  return {
    type: REMOVE_NODE,
    uid
  }
}

const actionCreators = {
  addNode,
  updateNode,
  removeNode
};

const actionTypes = {
  ADD_NODE,
  UPDATE_NODE,
  REMOVE_NODE,
  ADD_EDGE,
  REMOVE_EDGE,
  SET_EGO,
  UNSET_EGO
};

export {
  actionCreators,
  actionTypes
};

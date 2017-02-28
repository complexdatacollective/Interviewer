const ADD_NODE = 'ADD_NODE';
const REMOVE_NODE = 'REMOVE_NODE';
const ADD_EDGE = 'ADD_EDGE';
const REMOVE_EDGE = 'REMOVE_EDGE';
const SET_EGO = 'SET_EGO';
const UNSET_EGO = 'UNSET_EGO';

const initialState = {
  ego: {},
  nodes: [],
  edges: []
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case ADD_NODE:
      return {
        // rest parameters - ...state contains array of the rest of values of state (above)
        ...state,
        nodes: [...state.nodes, action.node]
      }
    case REMOVE_NODE:
      return {
        ...state,
        nodes: state.nodes.filter((node, index) => index !== action.index)
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

function removeNode(index) {
  return {
    type: REMOVE_NODE,
    index
  }
}

const actionCreators = {
  addNode,
  removeNode
};

const actionTypes = {
  ADD_NODE,
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

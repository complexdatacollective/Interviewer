import { REHYDRATE } from 'redux-persist/constants'
import { actionTypes as protocolActionTypes } from '../../ducks/modules/protocol';

const NEXT_STAGE = 'NEXT_STAGE';
const PREVIOUS_STAGE = 'PREVIOUS_STAGE';
const SET_STAGE = 'SET_STAGE';

const initialState = {
  index: 0,
  count: 0,
};

const rotateIndex = (max, next) => {
  return (next + max) % max;
}

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case protocolActionTypes.SET_PROTOCOL:
      return {
        ...initialState,
        count: action.protocol.stages.length,
      }
    case REHYDRATE:
      if (!action.payload.protocol) { return { ...state }; }
      const protocol = action.payload.protocol.protocolConfig;
      return {
        ...initialState,
        count: protocol.stages.length,
      }
    case NEXT_STAGE:
      return {
        ...state,
        index: rotateIndex(state.count, state.index + 1)
      }
    case PREVIOUS_STAGE:
      return {
        ...state,
        index: rotateIndex(state.count, state.index - 1)
      }
    case SET_STAGE:
      return {
        ...state,
        index: action.index
      }
    default:
      return state;
  }
};

function next() {
  return {
    type: NEXT_STAGE
  }
}

function previous() {
  return {
    type: PREVIOUS_STAGE
  }
}

function setStage(index) {
  return {
    type: 'SET_STAGE',
    index
  }
}

const actionCreators = {
  next,
  previous,
  setStage,
};

const actionTypes = {
  NEXT_STAGE,
  PREVIOUS_STAGE,
  SET_STAGE,
};

export {
  actionCreators,
  actionTypes,
};

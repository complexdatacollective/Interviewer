import { actionTypes as protocolActionTypes } from '../../ducks/modules/protocol';

const NEXT_STAGE = 'NEXT_STAGE';
const PREVIOUS_STAGE = 'PREVIOUS_STAGE';

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
        count: action.protocol.stages.length
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

const actionCreators = {
  next,
  previous,
};

const actionTypes = {
  NEXT_STAGE,
  PREVIOUS_STAGE,
};

export {
  actionCreators,
  actionTypes,
};

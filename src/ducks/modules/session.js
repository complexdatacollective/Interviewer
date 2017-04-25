import { actionTypes as protocolActionTypes } from '../../ducks/modules/protocol';

const NEXT_STAGE = 'NEXT_STAGE';
const PREVIOUS_STAGE = 'PREVIOUS_STAGE';

const initialState = {
  stageIndex: 0,
  stageCount: 0,
};

const rotateIndex = (max, next) => {
  return (next + max) % max;
}

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case protocolActionTypes.SET_PROTOCOL:
      const stageCount = action.protocol.stages.length;
      return {
        ...initialState,
        stageCount: stageCount,
      }
      case NEXT_STAGE:
        return {
          ...state,
          stageIndex: rotateIndex(state.stageCount, state.stageIndex + 1)
        }
      case PREVIOUS_STAGE:
        return {
          ...state,
          stageIndex: rotateIndex(state.stageCount, state.stageIndex - 1)
        }
    default:
      return state;
  }
};

function nextStage() {
  return {
    type: NEXT_STAGE
  }
}

function previousStage() {
  return {
    type: PREVIOUS_STAGE
  }
}

const actionCreators = {
  nextStage,
  previousStage,
};

const actionTypes = {
  NEXT_STAGE,
  PREVIOUS_STAGE,
};

export {
  actionCreators,
  actionTypes,
};

import { REHYDRATE } from 'redux-persist/constants';
import { actionTypes as protocolActionTypes } from '../protocol';

const NEXT_STAGE = 'NEXT_STAGE';
const PREVIOUS_STAGE = 'PREVIOUS_STAGE';
const SET_STAGE_ID = 'SET_STAGE_ID';
const SET_STAGE_INDEX = 'SET_STAGE_INDEX';

const initialState = {
  index: 0,
  count: 0,
};

const rotateIndex = (max, nextIndex) => (nextIndex + max) % max;

const getStageIndex = (stages, stageId) => {
  let stageIndex = stages.findIndex(stage => stage.id === stageId);
  if (stageIndex < 0) stageIndex = 0;
  return stageIndex;
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case protocolActionTypes.SET_PROTOCOL:
      return {
        ...initialState,
        count: action.protocol.stages.length,
      };
    case REHYDRATE: {
      if (!action.payload.protocol) { return { ...state }; }
      const protocol = action.payload.protocol;
      return {
        ...initialState,
        count: protocol.stages.length,
      };
    }
    case NEXT_STAGE:
      return {
        ...state,
        index: rotateIndex(state.count, state.index + 1),
      };
    case PREVIOUS_STAGE:
      return {
        ...state,
        index: rotateIndex(state.count, state.index - 1),
      };
    case SET_STAGE_ID:
      return {
        ...state,
        index: getStageIndex(action.stages, action.id),
      };
    case SET_STAGE_INDEX:
      return {
        ...state,
        index: action.index,
      };
    default:
      return state;
  }
}

function next() {
  return {
    type: NEXT_STAGE,
  };
}

function previous() {
  return {
    type: PREVIOUS_STAGE,
  };
}

function setStageId(stages, id) {
  return {
    type: SET_STAGE_ID,
    stages,
    id,
  };
}

function setStageIndex(index) {
  return {
    type: SET_STAGE_INDEX,
    index,
  };
}

const actionCreators = {
  next,
  previous,
  setStageId,
  setStageIndex,
};

const actionTypes = {
  NEXT_STAGE,
  PREVIOUS_STAGE,
  SET_STAGE_ID,
  SET_STAGE_INDEX,
};

export {
  actionCreators,
  actionTypes,
};

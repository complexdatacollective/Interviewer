import { REHYDRATE } from 'redux-persist/constants';
import { actionTypes as protocolActionTypes } from '../../ducks/modules/protocol';

const SET_STAGE = 'SET_STAGE';

const initialState = {
  index: 0,
  count: 0,
};

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
        index: getStageIndex(action.protocol.stages, action.stageId),
      };
    case REHYDRATE: {
      if (!action.payload.protocol) { return { ...state }; }
      const protocol = action.payload.protocol.protocolConfig;
      return {
        ...initialState,
        count: protocol.stages.length,
      };
    }
    case SET_STAGE:
      return {
        ...state,
        index: getStageIndex(action.stages, action.id),
      };
    default:
      return state;
  }
}

function setStage(stages, id) {
  return {
    type: SET_STAGE,
    stages,
    id,
  };
}

const actionCreators = {
  setStage,
};

const actionTypes = {
  SET_STAGE,
};

export {
  actionCreators,
  actionTypes,
};

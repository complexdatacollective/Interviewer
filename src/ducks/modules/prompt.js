import { REHYDRATE } from 'redux-persist/constants';
import { actionTypes as protocolActionTypes } from '../../ducks/modules/protocol';
import { actionTypes as stageActionTypes } from '../../ducks/modules/stage';

const NEXT_PROMPT = 'NEXT_PROMPT';
const PREVIOUS_PROMPT = 'PREVIOUS_PROMPT';

const initialState = {
  index: 0,
  counts: [],
};

const rotateIndex = (max, nextIndex) => (nextIndex + max) % max;

export default function reducer(state = initialState, action = {}, stageState) {
  switch (action.type) {
    case protocolActionTypes.SET_PROTOCOL:
      return {
        ...initialState,
        counts: action.protocol.stages.map(stage => stage.params.prompts.length),
      };
    case REHYDRATE: {
      if (!action.payload.protocol) { return { ...state }; }
      const protocol = action.payload.protocol.protocolConfig;
      return {
        ...initialState,
        counts: protocol.stages.map(stage => stage.params.prompts.length),
      };
    }
    case stageActionTypes.NEXT_STAGE:
    case stageActionTypes.PREVIOUS_STAGE:
      return {
        ...state,
        index: 0,
      };
    case NEXT_PROMPT:
      return {
        ...state,
        index: rotateIndex(state.counts[stageState.index], state.index + 1),
      };
    case PREVIOUS_PROMPT:
      return {
        ...state,
        index: rotateIndex(state.counts[stageState.index], state.index - 1),
      };
    default:
      return state;
  }
}

function next() {
  return {
    type: NEXT_PROMPT,
  };
}

function previous() {
  return {
    type: PREVIOUS_PROMPT,
  };
}

const actionCreators = {
  next,
  previous,
};

const actionTypes = {
  NEXT_PROMPT,
  PREVIOUS_PROMPT,
};

export {
  actionCreators,
  actionTypes,
};

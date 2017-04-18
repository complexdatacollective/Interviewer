import { actionTypes as protocolActionTypes } from '../../ducks/modules/protocol';

const NEXT_PROMPT = 'NEXT_PROMPT';
const PREVIOUS_PROMPT = 'PREVIOUS_PROMPT';
const NEXT_STAGE = 'NEXT_STAGE';
const PREVIOUS_STAGE = 'PREVIOUS_STAGE';

const initialState = {
  promptIndex: 0,
  promptCount: 0,
  stageIndex: 0,
  stageCount: 0
};

const rotateIndex = (index, max) => {
  if(index < 0) {
    return max + index % max - 1;
  } else {
    return index % max;
  }
}

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case protocolActionTypes.SET_PROTOCOL:
      const stageCount = action.protocol.stages.length;
      const promptCount = action.protocol.stages[0].params.prompts.length;

      return {
        ...initialState,
        promptCount: promptCount,
        stageCount: stageCount,
      }
    case NEXT_PROMPT:
      return {
        ...state,
        promptIndex: rotateIndex(state.promptIndex + 1, state.promptCount)
      }
    case PREVIOUS_PROMPT:
      return {
        ...state,
        promptIndex: rotateIndex(state.promptIndex - 1, state.promptCount)
      }
      case NEXT_STAGE:
        return {
          ...state,
          promptIndex: 0,
          stageIndex: rotateIndex(state.stageIndex + 1, state.stageCount)
        }
      case PREVIOUS_STAGE:
        return {
          ...state,
          promptIndex: 0,
          stageIndex: rotateIndex(state.stageIndex - 1, state.stageCount)
        }
    default:
      return state;
  }
};

function nextPrompt() {
  return {
    type: NEXT_PROMPT
  }
}

function previousPrompt() {
  return {
    type: PREVIOUS_PROMPT
  }
}

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
  nextPrompt,
  previousPrompt,
  nextStage,
  previousStage,
};

const actionTypes = {
  NEXT_PROMPT,
  PREVIOUS_PROMPT,
  NEXT_STAGE,
  PREVIOUS_STAGE,
};

export {
  actionCreators,
  actionTypes,
};

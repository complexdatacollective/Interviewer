import { actionTypes as protocolActionTypes } from '../../ducks/modules/protocol';
import { actionTypes as stageActionTypes } from '../../ducks/modules/stage';

const NEXT_PROMPT = 'NEXT_PROMPT';
const PREVIOUS_PROMPT = 'PREVIOUS_PROMPT';

const initialState = {
  index: 0,
  count: 0,
};

const rotateIndex = (max, next) => {
  return (next + max) % max;
}

export default function reducer(state = initialState, action = {}, stage) {
  switch (action.type) {
    case protocolActionTypes.SET_PROTOCOL:
    case stageActionTypes.NEXT_STAGE:
    case stageActionTypes.PREVIOUS_STAGE:
      return {
        ...initialState,
        count: action.protocol.stages[stage.index].params.prompts.length,
      }
    case NEXT_PROMPT:
      return {
        ...initialState,
        index: rotateIndex(state.count, state.index + 1)
      }
    case PREVIOUS_PROMPT:
      return {
        ...initialState,
        index: rotateIndex(state.count, state.index - 1)
      }
    default:
      return state;
  }
};

function next() {
  return {
    type: NEXT_PROMPT
  }
}

function previous() {
  return {
    type: PREVIOUS_PROMPT
  }
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

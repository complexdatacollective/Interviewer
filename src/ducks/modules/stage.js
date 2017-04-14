const NEXT_PROMPT = 'NEXT_PROMPT';
const PREVIOUS_PROMPT = 'PREVIOUS_PROMPT';

const initialState = {
  promptIndex: 0,
  promptCount: 2
};

const rotateIndex = (index, max) => {
  console.log(index, max)
  if(index < 0) {
    return max + index % max - 1;
  } else {
    return index % max;
  }
}

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
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

const actionCreators = {
  nextPrompt,
  previousPrompt
};

const actionTypes = {
  nextPrompt,
  previousPrompt,
};

export {
  actionCreators,
  actionTypes
};

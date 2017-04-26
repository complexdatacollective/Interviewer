import stageReducer from './stage';
import promptReducer from './prompt';

const initialState = {
  stage: stageReducer(),
  prompt: promptReducer(),
};

export default function reducer(state = initialState, action = {}) {
  const stage = stageReducer(state.stage, action);

  return {
    stage: stage,
    prompt: promptReducer(state.prompt, action, stage),
  }
};

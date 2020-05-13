import { useState } from 'react';

const useStageState = ({
  pairs,
  createEdge,
  addEdge,
  removeEdge,
  promptIndex,
  prompts,
  promptForward,
  promptBackward,
  onComplete,
}) => {
  const [state, setState] = useState({
    progress: null,
    current: 0,
    selected: null,
  });

  const next = () => {
    // save edge state
    const pair = pairs[state.current];
    const hasEdge = state.selected;
    const nextPair = state.current + 1;

    if (hasEdge) {
      addEdge({ from: pair[0], to: pair[1], type: createEdge });
    } else {
      removeEdge({ from: pair[0], to: pair[1], type: createEdge });
    }

    if (nextPair >= pairs.length && promptIndex + 1 < prompts.length) {
      setState(s => ({
        ...s,
        current: 0,
        selected: null,
        progress: 0,
      }));

      promptForward();
      return;
    }

    if (nextPair >= pairs.length) {
      onComplete();
    }

    setState(s => ({
      ...s,
      current: nextPair,
      selected: null,
      progress: s.progress > nextPair ? s.progress : nextPair,
    }));
  };

  const back = () => {
    if (state.current - 1 < 0 && promptIndex === 0) {
      onComplete();
      return;
    }

    if (state.current - 1 < 0) {
      setState(s => ({
        ...s,
        current: pairs.length - 1,
        selected: null,
        progress: pairs.length - 1,
      }));

      promptBackward();
      return;
    }

    setState(s => ({
      ...s,
      current: s.current - 1,
      selected: null,
    }));
  };

  const select = (value) => {
    setState(s => ({
      ...s,
      selected: value,
    }));
  };

  return [state, { back, next, select }];
};

export default useStageState;

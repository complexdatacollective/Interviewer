import { useState } from 'react';

const useSteps = (steps = [], onComplete) => {
  // [1, 2]
  const [state, setState] = useState({
    progress: { step: null, prompt: null },
    location: { step: 0, prompt: 0 },
  });

  const { location, progress } = state;

  const next = () => {
    const { step, prompt } = location;
    const nextStep = step + 1 > steps[prompt] - 1 ? 0 : step + 1;
    const nextPrompt = step + 1 > steps[prompt] - 1 ? prompt + 1 : prompt;

    if (nextPrompt > steps.length) {
      onComplete();
      return;
    }

    const nextLocation = {
      step: nextStep,
      prompt: nextPrompt,
    };

    const nextProgress =
      (location.nextStep > progress.step && location.nextPrompt >= progress.prompt) ?
        { step: nextStep, prompt: nextPrompt } :
        progress;

    setState(s => ({
      ...s,
      location: nextLocation,
      progress: nextProgress,
    }));
  };

  const previous = () => {
    const { step, prompt } = location;
    const nextPrompt = step - 1 < 0 ? prompt - 1 : prompt;
    const nextStep = step - 1 < 0 ? steps[nextPrompt] - 1 : step - 1;

    if (nextPrompt < 0) {
      onComplete();
      return;
    }

    setState(s => ({
      ...s,
      location: {
        step: nextStep,
        prompt: nextPrompt,
      },
    }));
  };

  return [state, { next, previous }];
};

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

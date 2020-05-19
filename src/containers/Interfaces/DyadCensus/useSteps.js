import { useState, useEffect } from 'react';
import { actionCreators as sessionsActions } from '../../../ducks/modules/sessions';

const useSteps = (
  steps = [], // map of steps per prompt, e.g. [3, 2, 1]
  prompt,
  { onComplete, dispatch },
) => {
  const promptSteps = steps[prompt];
  const promptCount = steps.length;

  const [state, setState] = useState({
    progress: null, // max step reached
    step: 0,
    direction: 'forward',
  });

  useEffect(() => {
    setState(s => ({
      ...s,
      progress: null, // max step reached
      step: 0,
      direction: 'forward',
    }));
  }, [prompt]);

  const updatePrompt = (nextIndex) => {
    if (nextIndex !== prompt) {
      dispatch(sessionsActions.updatePrompt(nextIndex));
    }
  };

  const next = () => {
    const nextStep = state.step + 1;

    if (nextStep > promptSteps - 1 && prompt >= promptCount - 1) {
      onComplete();
      return;
    }

    if (nextStep > promptSteps - 1) {
      updatePrompt(prompt + 1);
      return;
    }

    const nextProgress = nextStep > state.progress ? nextStep : state.progress;

    setState(s => ({
      ...s,
      step: nextStep,
      progress: nextProgress,
      direction: 'forward',
    }));
  };

  const previous = () => {
    const nextStep = state.step - 1;

    if (nextStep < 0 && prompt === 0) {
      onComplete();
      return;
    }

    if (nextStep < 0) {
      updatePrompt(prompt - 1);
      return;
    }

    setState(s => ({
      ...s,
      step: nextStep,
      direction: 'backward',
    }));
  };

  return [state, next, previous];
};

export default useSteps;

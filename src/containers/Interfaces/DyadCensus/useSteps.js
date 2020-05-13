import { useState } from 'react';
import { actionCreators as sessionsActions } from '../../../ducks/modules/sessions';

const useSteps = (
  location = { step: 0, prompt: 0 },
  steps = [],
  { onComplete, dispatch },
) => {
  // [1, 2]
  const [state, setState] = useState({
    progress: { step: null, prompt: null },
    location,
  });

  const next = () => {
    const { step, prompt } = state.location;
    const nextStep = step + 1 > steps[prompt] - 1 ? 0 : step + 1;
    const nextPrompt = step + 1 > steps[prompt] - 1 ? prompt + 1 : prompt;

    if (nextPrompt > steps.length - 1) {
      onComplete();
      return;
    }

    const nextLocation = {
      step: nextStep,
      prompt: nextPrompt,
    };

    const nextProgress =
      (
        state.location.nextStep > state.progress.step &&
        state.location.nextPrompt >= state.progress.prompt
      ) ?
        { step: nextStep, prompt: nextPrompt } :
        state.progress;

    setState(s => ({
      ...s,
      location: nextLocation,
      progress: nextProgress,
    }));

    dispatch(sessionsActions.updatePrompt(nextLocation.prompt));
  };

  const previous = () => {
    const { step, prompt } = state.location;
    let nextPrompt = prompt;
    let nextStep = step - 1;

    if (nextStep < 0) {
      nextPrompt = prompt - 1;

      if (nextPrompt < 0) {
        onComplete();
        return;
      }

      nextStep = steps[nextPrompt] - 1;
    }

    const nextLocation = {
      step: nextStep,
      prompt: nextPrompt,
    };

    setState(s => ({
      ...s,
      location: nextLocation,
    }));

    dispatch(sessionsActions.updatePrompt(nextLocation.prompt));
  };

  return [state, next, previous];
};

export default useSteps;

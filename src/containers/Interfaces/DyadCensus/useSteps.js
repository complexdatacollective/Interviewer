import { useState } from 'react';
import { actionCreators as sessionsActions } from '../../../ducks/modules/sessions';

/**
 * returns -1 if location is behind progress
 * returns 1 if location is ahead of progress
 * returns 0 if location and progress are equal
 */
export const compareSteps = (progress, location) => {
  if (progress.prompt > location.prompt) { return -1; }
  if (progress.prompt < location.prompt) { return 1; }
  if (progress.step > location.step) { return -1; }
  if (progress.step < location.step) { return 1; }
  return 0;
};

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

  const updatePrompt = (nextIndex) => {
    if (nextIndex !== state.location.prompt) {
      dispatch(sessionsActions.updatePrompt(nextIndex));
    }
  };

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

    const hasNoProgress = state.progress.step === null;
    const isLocationAheadOfProgress =
      (
        nextLocation.step > state.progress.step &&
        nextLocation.prompt === state.progress.prompt
      ) ||
      nextLocation.prompt > state.progress.prompt;
    const nextProgress = hasNoProgress || isLocationAheadOfProgress ?
      { step: nextStep, prompt: nextPrompt } :
      state.progress;

    setState(s => ({
      ...s,
      location: nextLocation,
      progress: nextProgress,
    }));

    updatePrompt(nextLocation.prompt);
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

    updatePrompt(nextLocation.prompt);
  };

  return [state, next, previous];
};

export default useSteps;

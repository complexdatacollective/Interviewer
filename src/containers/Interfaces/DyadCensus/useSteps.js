import { useState, useEffect } from 'react';
import { actionCreators as sessionsActions } from '../../../ducks/modules/sessions';

const getSubStep = (steps, nextStep) => {
  const [r] = steps.reduce(([result, target], step, index) => {
    if (step > target && result === null) {
      return [{ step: target, of: index }];
    }

    if (step <= target) {
      return [result, target - step];
    }

    return [result, target];
  }, [null, nextStep]);

  return r;
};

const useSteps = (
  steps = [], // map of steps per prompt, e.g. [3, 2, 1]
) => {
  const totalSteps = steps.reduce((count, step) => count + step, 0);

  const [state, setState] = useState({
    progress: null, // max step reached
    step: 0,
    totalStep: 0,
    direction: 'forward',
    isFirstStep: true,
    isLastStep: false,
    isStart: true,
    isEnd: false,
  });

  const next = () => {
    const nextStep = state.totalStep + 1;

    if (nextStep >= totalSteps) {
      console.log('end!', totalSteps);
      return;
    }

    const nextProgress = nextStep > state.progress ? nextStep : state.progress;
    const substep = getSubStep(steps, nextStep);

    setState(s => ({
      ...s,
      step: substep.step,
      totalStep: nextStep,
      totalProgress: nextProgress,
      direction: 'forward',
      isFirstStep: substep.step === 0,
      isLastStep: substep.of - 1 >= substep.step,
      isStart: nextStep === 0,
      isEnd: nextStep === totalSteps - 1,
    }));
  };

  const previous = () => {
    const nextStep = state.totalStep - 1;

    if (nextStep < 0) {
      console.log('end! 0');
      return;
    }

    const substep = getSubStep(steps, nextStep);

    setState(s => ({
      ...s,
      step: substep.step,
      totalStep: nextStep,
      direction: 'backward',
      isFirstStep: substep.step === 0,
      isLastStep: substep.of - 1 >= substep.step,
      isStart: nextStep === 0,
      isEnd: nextStep === totalSteps - 1,
    }));
  };

  return [state, next, previous];
};

export default useSteps;

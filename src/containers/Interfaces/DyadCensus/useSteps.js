import { useState, useEffect } from 'react';

const getSubStep = (steps, nextStep) => {
  const [r] = steps.reduce(([result, target], step, index) => {
    if (step > target && result === null) {
      return [{ step: target, stage: index }];
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
    substep: 0,
    stage: 0,
    direction: 'forward',
    isStageStart: true,
    isStageEnd: false,
    isStart: true,
    isEnd: false,
  });

  const next = () => {
    const nextStep = state.step + 1;

    if (nextStep >= totalSteps) {
      return;
    }

    const nextProgress = nextStep > state.progress ? nextStep : state.progress;
    const substep = getSubStep(steps, nextStep);

    setState(s => ({
      ...s,
      step: nextStep,
      progress: nextProgress,
      substep: substep.step,
      stage: substep.stage,
      direction: 'forward',
      isStageStart: substep.step === 0,
      isStageEnd: substep.step >= steps[substep.stage] - 1,
      isStart: nextStep === 0,
      isEnd: nextStep === totalSteps - 1,
    }));
  };

  const previous = () => {
    const nextStep = state.step - 1;

    if (nextStep < 0) {
      return;
    }

    const substep = getSubStep(steps, nextStep);

    setState(s => ({
      ...s,
      step: nextStep,
      substep: substep.step,
      stage: substep.stage,
      direction: 'backward',
      isStageStart: substep.step === 0,
      isStageEnd: substep.step >= steps[substep.stage] - 1,
      isStart: nextStep === 0,
      isEnd: nextStep === totalSteps - 1,
    }));
  };

  return [state, next, previous];
};

export default useSteps;

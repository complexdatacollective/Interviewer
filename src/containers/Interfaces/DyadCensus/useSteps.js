import { useState } from 'react';

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

const updateState = ({
  step,
  substep,
  stage,
  direction,
}) =>
  state => ({
    ...state,
    step,
    progress: step > state.progress ? step : state.progress,
    substep,
    stage,
    direction,
    isStageStart: substep === 0,
    isStageEnd: substep >= state.steps[stage] - 1,
    isStart: step === 0,
    isEnd: step >= state.totalSteps - 1,
  });

const useSteps = (
  steps = [], // map of steps per prompt, e.g. [3, 2, 1]
) => {
  const totalSteps = steps.reduce((count, step) => count + step, 0);

  const initialValues = {
    steps,
    totalSteps,
    progress: null,
  };

  const [state, setState] = useState(
    updateState({
      step: 0,
      substep: 0,
      stage: 0,
      direction: 'forward',
    })(initialValues),
  );

  const next = () => {
    const nextStep = state.step + 1;

    if (nextStep >= totalSteps) {
      return;
    }

    const substep = getSubStep(steps, nextStep);

    setState(updateState({
      step: nextStep,
      substep: substep.step,
      stage: substep.stage,
      direction: 'forward',
    }));
  };

  const previous = () => {
    const nextStep = state.step - 1;

    if (nextStep < 0) {
      return;
    }

    const substep = getSubStep(steps, nextStep);

    setState(updateState({
      step: nextStep,
      substep: substep.step,
      stage: substep.stage,
      direction: 'backward',
    }));
  };

  return [state, next, previous];
};

export default useSteps;

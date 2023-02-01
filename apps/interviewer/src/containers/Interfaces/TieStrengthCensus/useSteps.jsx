import { useState } from 'react';

/* given a map of steps, where are we given a specific 'total' step number */
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

// state reducer for steps state
const stateReducer = ({
  step,
  substep,
  stage,
  direction,
}) => (state) => {
  const progress = step > state.progress ? step : state.progress;

  return ({
    ...state,
    step,
    progress,
    substep,
    stage,
    direction,
    isCompletedStep: progress > step,
    isStageStart: substep === 0,
    isStageEnd: substep >= state.steps[stage] - 1,
    isStart: step === 0,
    isEnd: step >= state.totalSteps - 1,
  });
};

/**
 * Models 'substeps' in prompts, which allows us to keep track
 * of overall progress, and where were are at within each
 * prompt.
 *
 * @param {array} steps - map of steps per prompt, e.g. [3, 2, 1]
 */
const useSteps = (
  steps = [],
) => {
  const totalSteps = steps.reduce((count, step) => count + step, 0);

  const initialValues = {
    steps,
    totalSteps,
    progress: null,
  };

  const [state, setState] = useState(
    stateReducer({
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

    setState(stateReducer({
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

    setState(stateReducer({
      step: nextStep,
      substep: substep.step,
      stage: substep.stage,
      direction: 'backward',
    }));
  };

  return [state, next, previous];
};

export default useSteps;

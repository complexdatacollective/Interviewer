/* eslint-disable import/prefer-default-export */

import { push } from 'connected-react-router';
import { isStageSkipped } from '../../selectors/skip-logic';
import { getSessionPath, getSessionProgress } from '../../selectors/session';
import { actionCreators as sessionsActions } from './sessions';

/**
 * Turn a positive or negative number into either +1/-1
 * @param {number} direction A positive or negative number indicating
 * forwards or backwards respectively.
 */
const getStep = (direction) => Math.abs(direction) / direction;
const isBackwards = (direction) => direction < 0;
const isForwards = (direction) => direction > 0;

/**
 * Go to the stage at the index provided
 * @param {number} index Index of the stage in protocol
 */
const goToStage = (index, direction) => (dispatch, getState) => {
  const state = getState();
  const back = direction === -1 ? '/?back' : '';
  const sessionPath = `${getSessionPath(state, index)}${back}`;

  return dispatch(push(sessionPath));
};

/**
 * Get the next (or last) stage, will skip past stages as specified by skipLogic.
 * @param {number} direction either +1/-1
 */
const getNextStage = (direction = 1) => (dispatch, getState) => {
  const state = getState();

  const {
    currentStage,
    screenCount,
  } = getSessionProgress(state);

  const step = getStep(direction);

  // starting point
  let nextIndex = currentStage + step;

  // iterate past any skipped steps
  while (isStageSkipped(nextIndex)(state)) {
    nextIndex += step;

    // If we're at either end of the inteview, stop and stay where we are
    if (nextIndex >= screenCount || nextIndex < 0) {
      return null;
    }
  }

  return nextIndex;
};

/**
 * Go to the next (or last) stage, will skip past stages as specified by skipLogic.
 * @param {number} direction either +1/-1
 */
const goToNextStage = (direction = 1) => (dispatch) => {
  const nextIndex = dispatch(getNextStage(direction));

  if (nextIndex === null) { return null; }

  return dispatch(goToStage(nextIndex, direction));
};

/**
 * Go to the next (or last) prompt.
 * @param {number} direction either +1/-1
 */
const goToNextPrompt = (direction = 1) => (dispatch, getState) => {
  const state = getState();
  const {
    promptCount,
    currentPrompt,
  } = getSessionProgress(state);

  const step = getStep(direction);
  const nextPrompt = (promptCount + currentPrompt + step) % promptCount;

  return dispatch(sessionsActions.updatePrompt(nextPrompt));
};

/**
 * Go to the next prompt or stage depending on the session state
 * @param {number} direction
 */
const goToNext = (direction = 1) => (dispatch, getState) => {
  const state = getState();
  const {
    promptCount,
    isFirstPrompt,
    isLastPrompt,
    isFirstStage,
    isLastScreen,
  } = getSessionProgress(state);

  const isLastPromptOrHasNone = !promptCount || isLastPrompt;
  const isFirstPromptOrHasNone = !promptCount || isFirstPrompt;
  const isLastScreenAndLastPrompt = isLastScreen && isLastPromptOrHasNone;

  if (
  // first screen:
    (isBackwards(direction) && isFirstStage && isFirstPromptOrHasNone)
      // when finish screen is absent we need to also check prompts:
      || (isForwards(direction) && isLastScreenAndLastPrompt)
  ) {
    return null;
  }

  if (!promptCount) {
    return dispatch(goToNextStage(direction));
  }

  // At the end of the prompts it's time to go to the next stage
  if (
    (isBackwards(direction) && isFirstPrompt)
      || (isForwards(direction) && isLastPrompt)
  ) {
    return dispatch(goToNextStage(direction));
  }

  return dispatch(goToNextPrompt(direction));
};

const actionCreators = {
  goToNextStage,
  goToNextPrompt,
  goToNext,
  goToStage,
};

export {
  actionCreators,
};

/* eslint-disable import/prefer-default-export */

import { push } from 'react-router-redux';
import { isStageSkipped } from '../../selectors/skip-logic';
import { getSessionPath, getSessionProgress } from '../../selectors/session';
import { actionCreators as sessionsActions } from '../../ducks/modules/sessions';

/**
 * Turn a positive or negative number into either +1/-1
 * @param {number} direction A positive or negative number indicating
 * forwards or backwards respectively.
 */
const getStep = direction =>
  Math.abs(direction) / direction;

/**
 * Go to the stage at the index provided
 * @param {number} index Index of the stage in protocol
 */
const goToStage = index =>
  (dispatch, getState) => {
    const state = getState();

    const sessionPath = getSessionPath(state, index);

    return dispatch(push(sessionPath));
  };

/**
 * Get the next (or last) stage, will skip past stages as specified by skipLogic.
 * @param {number} direction either +1/-1
 */
const getNextStage = (direction = 1) =>
  (dispatch, getState) => {
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
const goToNextStage = (direction = 1) =>
  (dispatch) => {
    const nextIndex = dispatch(getNextStage(direction));

    if (nextIndex === null) { return null; }

    return dispatch(goToStage(nextIndex));
  };

/**
 * Go to the next (or last) prompt.
 * @param {number} direction either +1/-1
 */
const goToNextPrompt = (direction = 1) =>
  (dispatch, getState) => {
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
const goToNext = (direction = 1) =>
  (dispatch, getState) => {
    const state = getState();
    const {
      promptCount,
      isFirstPrompt,
      isLastPrompt,
      isFirstStage,
      isLastStage,
      isLastScreen,
    } = getSessionProgress(state);

    const isFinishScreen = isLastScreen && !isLastStage;
    const isLastScreenAndPrompt = isLastScreen && !promptCount || isLastPrompt;

    if (
      // first screen:
      (direction < 0 && isFirstStage) ||
      (direction > 0 && isFinishScreen) ||
      // when finish screen is absent we need to check prompts:
      (direction > 0 && !isFinishScreen && isLastScreenAndPrompt)
    ) {
      return null;
    }

    if (!promptCount) {
      return dispatch(goToNextStage(direction));
    }

    // At the end of the prompts it's time to go to the next stage
    if ((direction < 0 && isFirstPrompt) || (direction > 0 && isLastPrompt)) {
      return dispatch(goToNextStage(direction));
    }

    return dispatch(goToNextPrompt(direction));
  };

const actionCreators = {
  goToNextStage,
  goToNextPrompt,
  goToNext,
};

export {
  actionCreators,
};

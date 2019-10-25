/* eslint-disable import/prefer-default-export */

import { push } from 'react-router-redux';
import { get } from 'lodash';
import { isStageSkipped } from '../../selectors/skip-logic';
import { getProtocolStages } from '../../selectors/protocol';

const goToStage = index =>
  (dispatch, getState) => {
    const state = getState();

    const sessionId = state.activeSessionId;

    if (!sessionId) {
      // TODO: throw error?
      return;
    }

    const sessionPath = `/session/${sessionId}`;

    dispatch(push(`${sessionPath}/${index}`));
  };

const goToNextStage = (direction = 1) =>
  (dispatch, getState) => {
    const state = getState();

    console.log('GO TO NEXT STAGE');

    const sessionId = state.activeSessionId;
    const session = get(state, ['sessions', sessionId]);

    if (!session) {
      // TODO: throw error?
      return;
    }

    const stages = getProtocolStages(state);
    const currentStageIndex = session.stageIndex;
    const lastStageIndex = stages.length - 1;
    let nextIndex = currentStageIndex + direction;

    while (isStageSkipped(nextIndex)(state)) {
      nextIndex += direction;
      if (nextIndex > lastStageIndex || nextIndex < 0) {
        // If we're at the end of the inteview, abort
        nextIndex = currentStageIndex;
        break;
      }
    }

    dispatch(goToStage(nextIndex));
  };

const actionCreators = {
  goToNextStage,
};

export {
  actionCreators,
};

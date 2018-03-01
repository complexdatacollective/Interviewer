/* eslint-disable no-shadow */
import { createSelector } from 'reselect';

const rotateIndex = (max, nextIndex) => (nextIndex + max) % max;

const stageIndex = state => state.session.stage.index;
const protocol = state => state.protocol;

export const sessionMenuIsOpen = state => state.menu.sessionMenuIsOpen;
export const stageMenuIsOpen = state => state.menu.stageMenuIsOpen;
export const stageSearchTerm = state => state.menu.stageSearchTerm;

export const stages = createSelector(
  protocol,
  protocol => protocol.stages,
);

export const stage = createSelector(
  stageIndex,
  stages,
  (stageIndex, stages) => stages[stageIndex] || {},
);

export const getNextStageIndex = createSelector(
  stageIndex,
  stages,
  (stageIndex, stages) => rotateIndex(stages.length, parseInt(stageIndex, 10) + 1),
);

export const getPreviousStageIndex = createSelector(
  stageIndex,
  stages,
  (stageIndex, stages) => rotateIndex(stages.length, parseInt(stageIndex, 10) - 1),
);

export const filteredStages = createSelector(
  stageSearchTerm,
  stages,
  (stageSearchTerm, stages) =>
    stages.filter(stage => stage.label.toLowerCase().includes(stageSearchTerm.toLowerCase())),
);

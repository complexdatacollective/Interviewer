/* eslint-disable no-shadow */
import { createSelector } from 'reselect';

const protocol = state => state.protocol;

export const sessionMenuIsOpen = state => state.menu.sessionMenuIsOpen;
export const stageMenuIsOpen = state => state.menu.stageMenuIsOpen;
export const stageSearchTerm = state => state.menu.stageSearchTerm;

export const getPromptForCurrentSession = createSelector(
  state => (state.sessions[state.session] && state.sessions[state.session].promptIndex) || 0,
  promptIndex => promptIndex,
);

export const stages = createSelector(
  protocol,
  protocol => protocol.stages,
);

export const filteredStages = createSelector(
  stageSearchTerm,
  stages,
  (stageSearchTerm, stages) =>
    stages.filter(stage => stage.label.toLowerCase().includes(stageSearchTerm.toLowerCase())),
);

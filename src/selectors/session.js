/* eslint-disable no-shadow */
import { createSelector } from 'reselect';

import uuidv4 from '../utils/uuid';
import { initialState } from '../ducks/modules/session';

const DefaultFinishStage = {
  // `id` is used as component key; must be unique from user input
  id: uuidv4(),
  type: 'FinishSession',
  label: 'Finish Interview',
};

const protocol = state => state.protocol;
const withFinishStage = stages => (stages.length ? [...stages, DefaultFinishStage] : []);

export const anySessionIsActive = state => state.session && state.session !== initialState;
export const settingsMenuIsOpen = state => state.menu.settingsMenuIsOpen;
export const stageMenuIsOpen = state => state.menu.stageMenuIsOpen;
export const stageSearchTerm = state => state.menu.stageSearchTerm;

export const getPromptForCurrentSession = createSelector(
  state => (state.sessions[state.session] && state.sessions[state.session].promptIndex) || 0,
  promptIndex => promptIndex,
);

export const stages = createSelector(
  protocol,
  protocol => withFinishStage(protocol.stages),
);

export const filteredStages = createSelector(
  stageSearchTerm,
  stages,
  (stageSearchTerm, stages) =>
    stages.filter(stage => stage.label.toLowerCase().includes(stageSearchTerm.toLowerCase())),
);

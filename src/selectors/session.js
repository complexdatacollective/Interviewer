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

export const getCurrentSession = state => state.sessions[state.session];
export const anySessionIsActive = state => state.session && state.session !== initialState;

export const getPromptForCurrentSession = createSelector(
  state => (state.sessions[state.session] && state.sessions[state.session].promptIndex) || 0,
  promptIndex => promptIndex,
);

export const stages = createSelector(
  protocol,
  protocol => withFinishStage(protocol.stages),
);

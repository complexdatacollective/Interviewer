/* eslint-disable no-shadow */
import { createSelector } from 'reselect';

import uuidv4 from '../utils/uuid';
import { currentStageIndex } from '../utils/matchSessionPath';
import { getSubject } from '../utils/protocol/accessors';
import { initialState } from '../ducks/modules/session';
import { protocolRegistry } from './protocol';

const DefaultFinishStage = {
  // `id` is used as component key; must be unique from user input
  id: uuidv4(),
  type: 'FinishSession',
  label: 'Finish Interview',
};

const protocol = state => state.protocol;
const currentPathname = router => router && router.location && router.location.pathname;
const stageIndexForCurrentSession = state => currentStageIndex(currentPathname(state.router));
const withFinishStage = stages => (stages && stages.length ? [...stages, DefaultFinishStage] : []);

export const getCurrentSession = state => state.sessions[state.session];
export const anySessionIsActive = state => state.session && state.session !== initialState;

export const stages = createSelector(
  protocol,
  protocol => withFinishStage(protocol.stages),
);

export const getStageForCurrentSession = createSelector(
  stages,
  stageIndexForCurrentSession,
  (stages, stageIndex) => stages[stageIndex],
);

// TODO: naming
export const getPromptForCurrentSession = createSelector(
  state => (state.sessions[state.session] && state.sessions[state.session].promptIndex) || 0,
  promptIndex => promptIndex,
);

export const getPromptObjectForCurrentSession = createSelector(
  getStageForCurrentSession,
  getPromptForCurrentSession,
  (stage, promptIndex) => stage && stage.prompts && stage.prompts[promptIndex],
);

// @return {Array} An object entry ([key, object]) for the current node type
//  from the variable registry
export const getNodeEntryForCurrentPrompt = createSelector(
  protocolRegistry,
  getPromptObjectForCurrentSession,
  getStageForCurrentSession,
  (registry, prompt, stage) => {
    if (!registry || !registry.node || !prompt || !stage) {
      return null;
    }
    const subject = getSubject(stage, prompt);
    const nodeType = subject && subject.type;
    const nodeTypeDefinition = nodeType && registry.node[nodeType];
    if (nodeTypeDefinition) {
      return [nodeType, nodeTypeDefinition];
    }
    return null;
  },
);

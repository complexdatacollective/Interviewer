/* eslint-disable no-shadow */
import { createSelector } from 'reselect';

import uuidv4 from '../utils/uuid';
import { currentStageIndex } from '../utils/matchSessionPath';
import { getAdditionalAttributes, getSubject } from '../utils/protocol/accessors';
import { initialState } from '../ducks/modules/session';
import { protocolRegistry } from './protocol';

const DefaultFinishStage = {
  // `id` is used as component key; must be unique from user input
  id: uuidv4(),
  type: 'FinishSession',
  label: 'Finish Interview',
};

const protocol = state => state.importProtocol;
const currentPathname = router => router && router.location && router.location.pathname;
const stageIndexForCurrentSession = state => currentStageIndex(currentPathname(state.router));
const withFinishStage = stages => (stages && stages.length ? [...stages, DefaultFinishStage] : []);

export const getCurrentSession = state => state.sessions[state.activeSessionId];
export const anySessionIsActive =
  state => state.activeSessionId && state.activeSessionId !== initialState;

export const stages = createSelector(
  protocol,
  protocol => withFinishStage(protocol.stages),
);

export const getStageForCurrentSession = createSelector(
  stages,
  stageIndexForCurrentSession,
  (stages, stageIndex) => stages[stageIndex],
);

export const getPromptIndexForCurrentSession = createSelector(
  state => (
    state.sessions[state.activeSessionId] && state.sessions[state.activeSessionId].promptIndex
  ) || 0,
  promptIndex => promptIndex,
);

const getPromptForCurrentSession = createSelector(
  getStageForCurrentSession,
  getPromptIndexForCurrentSession,
  (stage, promptIndex) => stage && stage.prompts && stage.prompts[promptIndex],
);

// @return {Array} An object entry ([key, object]) for the current node type
//  from the variable registry
export const getNodeEntryForCurrentPrompt = createSelector(
  protocolRegistry,
  getPromptForCurrentSession,
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

export const getAdditionalAttributesForCurrentPrompt = createSelector(
  getPromptForCurrentSession,
  getStageForCurrentSession,
  (prompt, stage) => getAdditionalAttributes(stage, prompt),
);

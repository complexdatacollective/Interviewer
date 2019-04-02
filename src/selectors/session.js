/* eslint-disable no-shadow */
import { createSelector } from 'reselect';
import { currentStageIndex } from '../utils/matchSessionPath';
import { getAdditionalAttributes, getSubject } from '../utils/protocol/accessors';
import { createDeepEqualSelector } from './utils';
import { initialState } from '../ducks/modules/session';
import { getProtocolCodebook, getProtocolStages } from './protocol';

const currentPathname = router => router && router.location && router.location.pathname;
const stageIndexForCurrentSession = state => currentStageIndex(currentPathname(state.router));

export const getActiveSession = state =>
  state.activeSessionId && state.sessions[state.activeSessionId];

export const getCaseId = createDeepEqualSelector(
  getActiveSession,
  session => (session && session.caseId),
);

export const anySessionIsActive =
  state => state.activeSessionId && state.activeSessionId !== initialState;

export const getStageForCurrentSession = createSelector(
  (state, props) => getProtocolStages(state, props),
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
  (state, props) => getProtocolCodebook(state, props),
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

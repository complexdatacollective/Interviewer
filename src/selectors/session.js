/* eslint-disable no-shadow */
import { createSelector } from 'reselect';

const stageIndex = state => state.session.stage.index;
const promptIndex = state => state.session.prompt.index;
const protocol = state => state.protocol.config;

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
  (stageIndex, stages) => stages[stageIndex],
);

export const filteredStages = createSelector(
  stageSearchTerm,
  stages,
  (stageSearchTerm, stages) =>
    stages.filter(stage => stage.title.toLowerCase().includes(stageSearchTerm.toLowerCase())),
);

const prompt = createSelector(
  promptIndex,
  stage,
  (promptIndex, stage) => stage.params.prompts[promptIndex],
);

export const activePromptAttributes = createSelector(
  prompt,
  prompt => prompt.nodeAttributes,
);

export const activeStageAttributes = createSelector(
  stage,
  stage => ({ type: stage.params.nodeType }),
);

export const activeOriginAttributes = createSelector(
  prompt,
  stage,
  (prompt, stage) => ({ stageId: stage.id, promptId: prompt.id }),
);

export const newNodeAttributes = createSelector(
  activePromptAttributes,
  activeStageAttributes,
  activeOriginAttributes,
  (activePromptAttributes, activeStageAttributes, activeOriginAttributes) =>
    ({ ...activePromptAttributes, ...activeStageAttributes, ...activeOriginAttributes }),
);

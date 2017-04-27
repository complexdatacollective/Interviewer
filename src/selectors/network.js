import { createSelector } from 'reselect'
import { diff, nodeIncludesAttributes } from '../utils/Network';

const stageIndex = state => state.session.stage.index;
const promptIndex = state => state.session.prompt.index;
const protocol = state => state.protocol.protocolConfig;
const network = state => state.network;

const stage = createSelector(
  stageIndex,
  protocol,
  (stageIndex, protocol) => protocol.stages[stageIndex]
)

const prompt = createSelector(
  promptIndex,
  stage,
  (promptIndex, stage) => {
    console.log('PROMPT', promptIndex, stage)
    return stage.params.prompts[promptIndex];
  }
)

export const activePromptAttributes = createSelector(
  prompt,
  (prompt) => prompt.nodeAttributes
)

export const activeStageAttributes = createSelector(
  stage,
  (stage) => {
    return { type: stage.params.nodeType, stageId: stage.id };
  }
)

export const activeNodeAttributes = createSelector(
  activeStageAttributes,
  activePromptAttributes,
  (activeStageAttributes, activePromptAttributes) => {
    return { ...activeStageAttributes, ...activePromptAttributes };
  }
)

export const activeNetwork = createSelector(
  network,
  activeNodeAttributes,
  (network, activeNodeAttributes) => {
    return nodeIncludesAttributes(network, activeNodeAttributes);
  }
)

export const existingNetwork = createSelector(
  activeStageAttributes,
  network,
  (activeStageAttributes, network) => {
    return diff(network, nodeIncludesAttributes(network, activeStageAttributes));
  }
)

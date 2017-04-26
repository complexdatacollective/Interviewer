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
  (promptIndex, stage) => stage.params.prompts[promptIndex]
)

const activePromptAttributes = createSelector(
  prompt,
  (prompt) => prompt.nodeAttributes
)

export const activeNodeAttributes = createSelector(
  stage,
  activePromptAttributes,
  (stage, activePromptAttributes) => {
    return { type: stage.params.nodeType, stageId: stage.id, ...activePromptAttributes };
  }
)

export const activeNetwork = createSelector(
  network,
  activeNodeAttributes,
  (network, activeNodeAttributes) => {
    return nodeIncludesAttributes(network, activeNodeAttributes);
  }
)

export const inactiveNetwork = createSelector(
  network,
  activeNetwork,
  (network, activeNetwork) => {
    return diff(network, activeNetwork)
  }
)

/* eslint-disable import/prefer-default-export */

import { createSelector } from 'reselect';

const propStageId = (_, props) => props.config.id;
const propPromptId = (_, props) => props.prompt.id;
export const propStageNodeType = (_, props) => props.config.params.nodeType;

export const propPromptIds = createSelector(
  [propStageId, propPromptId],
  (stageId, promptId) => ({ stageId, promptId }),
);

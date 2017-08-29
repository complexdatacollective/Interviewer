/* eslint-disable import/prefer-default-export */

import { createSelector } from 'reselect';
import { filter, reject } from 'lodash';
import { propPromptIds, propStageNodeType } from './props';

export const networkNodes = state => state.network.nodes;

export const networkNodesForPrompt = createSelector(
    [networkNodes, propPromptIds],
    (nodes, attributes) => filter(nodes, attributes),
  );

export const otherNetworkNodesWithStageNodeType = createSelector(
    [networkNodes, propStageNodeType, propPromptIds],
    (nodes, nodeType, promptAttributes) => reject(filter(nodes, ['type', nodeType]), promptAttributes),
  );

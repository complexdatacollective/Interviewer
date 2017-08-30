/* eslint-disable import/prefer-default-export */

import { createSelector } from 'reselect';
import { filter, reject } from 'lodash';
import { propPromptIds, propStageNodeType } from './props';

export const networkNodes = state => state.network.nodes;

export const networkNodesOfStageType = createSelector(
    [networkNodes, propStageNodeType],
    (nodes, nodeType) => filter(nodes, ['type', nodeType]),
  );

export const networkNodesForPrompt = createSelector(
    [networkNodes, propPromptIds],
    (nodes, attributes) => filter(nodes, attributes),
  );

export const otherNetworkNodesWithStageNodeType = createSelector(
    [networkNodesOfStageType, propPromptIds],
    (nodes, promptAttributes) => reject(nodes, promptAttributes),
  );

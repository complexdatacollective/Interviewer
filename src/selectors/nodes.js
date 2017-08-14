/* eslint-disable */ // no-shadow */
import { createSelector } from 'reselect';
import { filter } from 'lodash';
import { activePromptLayout, activeStageAttributes } from './session';

const nodes = state => state.network.nodes;

// Filter the nodes according to current prompt layout (AND stage)
export const placedNodes = createSelector(
  nodes,
  activePromptLayout,
  activeStageAttributes,
  (nodes, activePromptLayout, activeStageAttributes) => {
    const nodeHasLayout = (node) => (
      Object.prototype.hasOwnProperty.call(node, 'layouts') &&
      Object.prototype.hasOwnProperty.call(node.layouts, activePromptLayout)
    );

    return filter(
      filter(nodes, nodeHasLayout),
      ['type', activeStageAttributes.type],
    );
  }
);

// Filter the network:
// - Node is not from this layout prompt
// - Node is the same type as current stage
export const unplacedNodes = createSelector(
  nodes,
  activePromptLayout,
  activeStageAttributes,
  (nodes, activePromptLayout, activeStageAttributes) => {
    const nodeWithoutLayout = (node) => (
      !(
        Object.prototype.hasOwnProperty.call(node, 'layouts') &&
        Object.prototype.hasOwnProperty.call(node.layouts, activePromptLayout)
      )
    );

    return filter(
      filter(nodes, nodeWithoutLayout),
      ['type', activeStageAttributes.type],
    );
  }
);

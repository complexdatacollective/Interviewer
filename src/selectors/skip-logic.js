import { createSelector } from 'reselect';

import filter from '../utils/networkQuery/filter';
import { getProtocolStages } from './protocol';
import { getNetwork } from './network';
import { SkipLogicAction } from '../protocol-consts';

const rotateIndex = (max, nextIndex) => (nextIndex + max) % max;
const maxLength = state => getProtocolStages(state).length;

export const getNextIndex = index => createSelector(
  maxLength,
  max => rotateIndex(max, index),
);

const getSkipLogic = index => createSelector(
  getProtocolStages,
  stages => stages && stages[index] && stages[index].skipLogic,
);

const getFilterOptions = index => createSelector(
  getSkipLogic(index),
  logic => logic && logic.filter,
);

const getJoinType = index => createSelector(
  getFilterOptions(index),
  filterOptions => filterOptions && filterOptions.join,
);

const getRules = index => createSelector(
  getFilterOptions(index),
  filterOptions => (filterOptions && filterOptions.rules) || [],
);

const getFilterFunction = index => createSelector(
  getJoinType(index),
  getRules(index),
  (join, rules) => filter({ rules, join }),
);

const filterNetwork = index => createSelector(
  getFilterFunction(index),
  getNetwork,
  (filterFunction, network) => filterFunction(network),
);

const isSkipAction = index => createSelector(
  getSkipLogic(index),
  logic => logic && logic.action === SkipLogicAction.SKIP,
);

export const isStageSkipped = index => createSelector(
  getSkipLogic(index),
  isSkipAction(index),
  filterNetwork(index),
  (logic, action, results) => {
    if (!logic) return false;

    // Handle skipLogic with no rules defined differently depending on action.
    // skipLogic.action === SHOW <- always show the stage
    // skipLogic.action === SKIP <- always skip the stage
    // Allows for a quick way to disable a stage by setting SKIP if, and then
    // not defining rules.
    // Should be changed with https://github.com/codaco/Architect/issues/517
    if (!logic.filter.rules || !logic.filter.rules.length === 0) {
      console.warn('Encountered skip logic with no rules defined at index', index); // eslint-disable-line no-console
      return !!action;
    }
    const outerQuery = results.nodes.length > 0;
    return !!logic && ((action && outerQuery) || (!action && !outerQuery));
  },
);

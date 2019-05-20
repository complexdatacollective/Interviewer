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

    const outerQuery = results.nodes.length > 0;
    return !!logic && ((action && outerQuery) || (!action && !outerQuery));
  },
);

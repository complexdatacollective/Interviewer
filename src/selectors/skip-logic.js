import { createSelector } from 'reselect';

import filter from '../utils/networkQuery/filter';
import predicate from '../utils/networkQuery/predicate';
import { getProtocolStages } from './protocol';
import { getNetwork } from './network';
import { SkipLogicAction, SkipLogicOperator } from '../protocol-consts';

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

const getSkipValue = index => createSelector(
  getSkipLogic(index),
  logic => logic && logic.value && Math.trunc(logic.value),
);

const getSkipOperator = index => createSelector(
  getSkipLogic(index),
  logic => logic && logic.operator,
);

export const isStageSkipped = index => createSelector(
  getSkipLogic(index),
  isSkipAction(index),
  getSkipOperator(index),
  getSkipValue(index),
  filterNetwork(index),
  (logic, action, operator, comparisonValue, results) => {
    if (!logic) return false;

    let outerQuery = false;
    switch (operator) {
      case SkipLogicOperator.NONE:
        outerQuery = !results.nodes.length;
        break;
      case SkipLogicOperator.ANY:
        outerQuery = results.nodes.length > 0;
        break;
      default:
        outerQuery = predicate(operator)(
          { value: results.nodes.length, other: comparisonValue });
    }

    return !!logic && ((action && outerQuery) || (!action && !outerQuery));
  },
);

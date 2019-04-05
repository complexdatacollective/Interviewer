import { createSelector } from 'reselect';

import * as query from '../utils/networkQuery/query';
import predicate from '../utils/networkQuery/predicate';
import { getProtocolStages } from './protocol';
import { getNetwork } from './network';
import { FilterJoin, RuleType, SkipLogicAction, SkipLogicOperator } from '../protocol-consts';

const rotateIndex = (max, nextIndex) => (nextIndex + max) % max;
const maxLength = state => getProtocolStages(state).length;

const mapRuleType = (type) => {
  switch (type) {
    case RuleType.alter:
      return query.alterRule;
    case RuleType.ego:
      return query.egoRule;
    case RuleType.edge:
      return query.edgeRule;
    default:
      return () => {};
  }
};

export const getNextIndex = index => createSelector(
  maxLength,
  max => rotateIndex(max, index),
);

const getSkipLogic = index => createSelector(
  getProtocolStages,
  stages => stages && stages[index] && stages[index].skipLogic,
);

const getFilter = index => createSelector(
  getSkipLogic(index),
  logic => logic && logic.filter,
);

const getJoinType = index => createSelector(
  getFilter(index),
  filter => ((filter && filter.join === FilterJoin.OR) ? query.or : query.and),
);

const getRules = index => createSelector(
  getFilter(index),
  filter => (filter && filter.rules) || [],
);

const convertRules = index => createSelector(
  getRules(index),
  rules => rules.filter(rule => rule.type && rule.options).map(
    rule => mapRuleType(rule.type)(rule.options),
  ),
);

const getFilterFunction = index => createSelector(
  getJoinType(index),
  convertRules(index),
  (join, rules) => join(rules),
);

const filterNetwork = index => createSelector(
  getFilterFunction(index),
  getNetwork,
  (filter, network) => filter(network),
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

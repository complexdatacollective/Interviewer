import { createSelector } from 'reselect';

import * as query from '../utils/networkQuery/query';
import predicate from '../utils/networkQuery/predicate';
import { stages as getStages } from './session';

const getNetwork = state => state.network;

const rotateIndex = (max, nextIndex) => (nextIndex + max) % max;
const maxLength = state => getStages(state).length;

const mapRuleType = (type) => {
  switch (type) {
    case 'alter':
      return 'query.alterRule';
    case 'ego':
      return 'query.egoRule';
    case 'edge':
      return 'query.edgeRule';
    default:
      return '';
  }
};

export const getNextIndex = index => createSelector(
  maxLength,
  max => rotateIndex(max, index),
);

const getSkipLogic = index => createSelector(
  getStages,
  stages => stages && stages[index] && stages[index].skipLogic,
);

const getFilter = index => createSelector(
  getSkipLogic(index),
  logic => logic && logic.filter,
);

const getJoinType = index => createSelector(
  getFilter(index),
  filter => ((filter && filter.join === 'OR') ? 'query.or' : 'query.and'),
);

const getRules = index => createSelector(
  getFilter(index),
  filter => (filter && filter.rules) || [],
);

const convertRules = index => createSelector(
  getRules(index),
  rules => rules.filter(rule => rule.type && rule.options).map(
    (rule) => {
      const fixedValue = typeof rule.options.value === 'number' ? rule.options.value : `'${rule.options.value}'`;
      return `${mapRuleType(rule.type)}({
        type: '${rule.options.type}',
        attribute: '${rule.options.attribute}',
        operator: '${rule.options.operator}',
        value: ${fixedValue},
      })`;
    },
  ),
);

const getFilterFunction = index => createSelector(
  getJoinType(index),
  convertRules(index),
  (join, rules) => {
    const filterMethod = `
      return ${join}([${rules}]);
    `;
    const Fn = Function;
    const functionize = method => new Fn('query', `${method}`)(query);

    return functionize(filterMethod);
  },
);

const filterNetwork = index => createSelector(
  getFilterFunction(index),
  getNetwork,
  (filter, network) => filter(network),
);

const isSkipAction = index => createSelector(
  getSkipLogic(index),
  logic => logic && logic.action === 'SKIP',
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
    const outerQuery = predicate(operator)(
      { value: results.nodes.length, other: comparisonValue });

    return !!logic && ((action && outerQuery) || (!action && !outerQuery));
  },
);

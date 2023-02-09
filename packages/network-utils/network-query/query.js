const { getSingleRule } = require('./rules');

const getGroup = (rule) => {
  const { type, options } = rule;
  if (type === 'ego') { return 'ego'; }

  if (
    options.operator === 'NOT_EXISTS'
    && !options.attribute
  ) {
    return `${type}_not_exists`;
  }

  return type;
};

const groupByType = (acc, rule) => {
  const mappedType = getGroup(rule);

  const typeRules = (acc[mappedType] || []).concat([rule]);

  return {
    ...acc,
    [mappedType]: typeRules,
  };
};

/**
 * Returns a method which can query the network.
 * The returned method takes a network object as an argument and returns a boolean.
 *
 * @param query
 * @param {Object[]} query.rules An array of rule options
 * @param {('ego'|'alter','edge')} query.rules[].type What the rule will act on
 * @param {Object} query.rules[].options The parameters of the rule
 * @param {Object} query.rules[].count The parameters used to assess the rule outcome
 *                                     (unless type is 'ego')
 * @param {('AND'|'OR')} query.join The method used to combine rule outcomes
 *
 * Example usage:
 *
 * ```
 * import getQuery from 'networkQuery/query';
 *
 * const config = {
 *   rules: [
 *     {
 *       type: 'alter',
 *       options: { type: 'person', attribute: 'name', operator: 'EXACTLY', value: 'Bill'},
 *     },
 *     {
 *       type: 'ego',
 *       options: { attribute: 'name', operator: 'EXACTLY', value: 'Bill'},
 *     },
 *   ],
 *   join: 'AND',
 * };
 *
 * const query = getQuery(config);
 * const result = query(network);
 */
const getQuery = ({ rules, join }) => {
  const ruleRunners = rules
    .map(getSingleRule)
    .reduce(groupByType, {});

  // use the built-in array methods
  const ruleIterator = join === 'AND'
    ? Array.prototype.every
    : Array.prototype.some;

  // Array.every(rule([type, typeRules]))
  return network => ruleIterator.call(Object.entries(ruleRunners), ([type, typeRules]) => {
    // 'ego' type rules run on a single node
    if (type === 'ego') {
      return ruleIterator.call(typeRules, rule => rule(network.ego));
    }

    // alter or edge not existing is a special case because the
    // whole network must be evaluated
    if (type === 'alter_not_exists' || type === 'edge_not_exists') {
      return ruleIterator.call(
        typeRules,
        rule => network.nodes.every(nodes => rule(nodes, network.edges)),
      );
    }

    /*
     * 'alter' and 'edge' type rules
     * If any of the nodes match, this rule passes.
     */
    return network.nodes.some(
      node =>
        ruleIterator.call(typeRules, rule => rule(node, network.edges)),
    );
  });
};

// Provides ES6 named + default imports via babel
Object.defineProperty(exports, '__esModule', {
  value: true,
});

exports.default = getQuery;

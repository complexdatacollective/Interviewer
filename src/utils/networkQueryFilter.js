/**
 * `@codaco/network-query` renamed the `alter` filter-rule type to `node`.
 * Protocol filter rules (schema <= 7) still use `alter`, so adapt them to
 * network-query's current API before querying/filtering. `ego` and `edge`
 * rule types are unchanged.
 */
const adaptRule = (rule) =>
  rule?.type === 'alter' ? { ...rule, type: 'node' } : rule;

export const adaptFilter = (filter) =>
  filter?.rules ? { ...filter, rules: filter.rules.map(adaptRule) } : filter;

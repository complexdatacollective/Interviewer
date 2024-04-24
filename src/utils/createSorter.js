import { entityAttributesProperty } from '@codaco/shared-consts';
import { get } from './lodash-replacements';

/**
 * Creating a collator that is reused by string comparison is significantly faster
 * than using `localeCompare` directly.
 *
 * See: https://stackoverflow.com/a/52369951/1497330
 *      https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Collator/Collator
 */
const collator = new Intl.Collator();

/* Maps a `_createdIndex` index value to all items in an array */
const withCreatedIndex = (items) => items.map(
  (item, _createdIndex) => ({ ...item, _createdIndex }),
);

/* all items without the '_createdIndex' prop */
const withoutCreatedIndex = (items) => items
  .map(({ _createdIndex, ...originalItem }) => originalItem);

/**
 * Helper that returns a function compatible with Array.sort that uses an
 * arbitrary `propertyGetter` function to fetch values for comparison.
 */
const asc = (propertyGetter) => (a, b) => {
  const firstValue = propertyGetter(a);
  const secondValue = propertyGetter(b);

  if (firstValue === null) {
    return 1;
  }

  if (secondValue === null) {
    return -1;
  }

  return -(firstValue < secondValue) || +(firstValue > secondValue);
};

/* As above, but with the items reversed (thereby reversing the sort order) */
const desc = (propertyGetter) => (a, b) => asc(propertyGetter)(b, a);

/**
 * Helper function that executes a series of functions in order, passing util
 * one of them returns a non-zero value.
 *
 * Used to chain together multiple sort functions.
 */
const chain = (...fns) => (a, b) => fns.reduce((diff, fn) => diff || fn(a, b), 0);

/**
  * Generates a sort function for strings that handles null/undefined values by
  * placing them at the end of the list.
  *
  * Also places non-strings at the end of the sorting order.
 */
const stringFunction = ({ property, direction }) => (a, b) => {
  const firstValue = get(a, property, null);
  const secondValue = get(b, property, null);

  if (firstValue === null || typeof firstValue !== 'string') {
    return 1;
  }

  if (secondValue === null || typeof secondValue !== 'string') {
    return -1;
  }

  if (direction === 'asc') {
    return collator.compare(firstValue, secondValue);
  }

  return collator.compare(secondValue, firstValue);
};

const categoricalFunction = ({ property, direction, hierarchy = [] }) => (a, b) => {
  // hierarchy is whatever order the variables were specified in the variable definition
  const firstValues = get(a, property, []);
  const secondValues = get(b, property, []);

  for (let i = 0; i < Math.max(firstValues.length, secondValues.length); i += 1) {
    const firstValue = i < firstValues.length ? firstValues[i] : null;
    const secondValue = i < secondValues.length ? secondValues[i] : null;

    if (firstValue !== secondValue) {
      // If one of the values is not in the hierarchy, it is sorted to the end of the list
      const firstIndex = hierarchy.indexOf(firstValue);
      const secondIndex = hierarchy.indexOf(secondValue);

      if (firstIndex === -1) {
        return 1;
      }
      if (secondIndex === -1) {
        return -1;
      }

      if (direction === 'asc') {
        return firstIndex - secondIndex;
      } return secondIndex - firstIndex; // desc
    }
  }

  return 0;
};

/**
 * Creates a sort function that sorts items according to the index of their
 * property value in a hierarchy array.
 */
const hierarchyFunction = ({ property, direction = 'desc', hierarchy = [] }) => (a, b) => {
  const firstValue = get(a, property);
  const secondValue = get(b, property);

  const firstIndex = hierarchy.indexOf(firstValue);
  const secondIndex = hierarchy.indexOf(secondValue);

  // If the value is not in the hierarchy, it is sorted to the end of the list
  if (firstIndex === -1) {
    return 1;
  }
  if (secondIndex === -1) {
    return -1;
  }

  if (direction === 'asc') {
    if (firstIndex > secondIndex) {
      return -1;
    }
    if (firstIndex < secondIndex) {
      return 1;
    }
  } else {
    if (firstIndex < secondIndex) {
      return -1;
    }
    if (firstIndex > secondIndex) {
      return 1;
    }
  }
  return 0;
};

const dateFunction = ({ property, direction }) => (a, b) => {
  const firstValueString = get(a, property, null);
  const secondValueString = get(b, property, null);

  const firstValueDate = Date.parse(firstValueString);
  const secondValueDate = Date.parse(secondValueString);

  if (Number.isNaN(firstValueDate)) {
    return 1;
  }

  if (Number.isNaN(secondValueDate)) {
    return -1;
  }

  if (direction === 'asc') {
    return -(firstValueDate < secondValueDate) || +(firstValueDate > secondValueDate);
  }

  return -(firstValueDate > secondValueDate) || +(firstValueDate < secondValueDate);
};

/**
 * Transforms sort rules into sort functions compatible with Array.sort.
 *
 * Return a function takes two values and returns a number indicating their
 * relative sort order.
 *
 * Returns -1 if a < b, 0 if a === b, and 1 if a > b.
 */
const getSortFunction = (rule) => {
  const {
    property,
    direction = 'asc',
    type, // REQUIRED! number, boolean, string, date, hierarchy, categorical
  } = rule;

  // LIFO/FIFO rule sorted by _createdIndex
  if (property === '*') {
    return direction === 'asc' ? asc((item) => get(item, '_createdIndex')) : desc((item) => get(item, '_createdIndex'));
  }

  if (type === 'string') { return stringFunction(rule); }

  if (type === 'boolean') { return direction === 'asc' ? asc((item) => get(item, property, false)) : desc((item) => get(item, property, true)); }

  if (type === 'number') { return direction === 'asc' ? asc((item) => get(item, property, Infinity)) : desc((item) => get(item, property, -Infinity)); }

  if (type === 'date') { return dateFunction(rule); }

  if (type === 'hierarchy') { return hierarchyFunction(rule); }

  if (type === 'categorical') { return categoricalFunction(rule); }

  // eslint-disable-next-line no-console
  console.warn('🤔 Sort rule missing required property \'type\', or type was not recognized. Sorting as a string, which may cause incorrect results. Supported types are: number, boolean, string, date, hierarchy, categorical');
  return stringFunction(rule);
};

/**
 * Creates a sort function that sorts a collection of items according to a set
 * of sort rules.
 *
 * Below is *heavily* inspired by this SO answer:
 * https://stackoverflow.com/questions/6913512/how-to-sort-an-array-of-objects-by-multiple-fields/72649463#72649463
 *
 */
const createSorter = (sortRules = []) => {
  const sortFunctions = sortRules.map(getSortFunction);
  return (items) => withoutCreatedIndex(withCreatedIndex(items).sort(chain(
    ...sortFunctions,
  )));
};

/**
 * Utility helper to map NC variable types to the types supported by the
 * createSorter function.
 *
 * Sort rules can only be of type:
 * - string
 * - boolean
 * - hierarchy
 * - number
 * - date
 * - categorical
 *
 * Network Canvas Variables can be of type:
 * - "boolean",
 * - "text",
 * - "number",
 * - "datetime",
 * - "ordinal",
 * - "scalar",
 * - "categorical",
 * - "layout",
 * - "location"
 */
export const mapNCType = (type) => {
  switch (type) {
    case 'text':
    case 'layout':
      return 'string';
    case 'number':
    case 'boolean':
    case '*':
      return type;
    case 'datetime':
      return 'date';
    case 'ordinal':
      return 'hierarchy';
    case 'categorical':
      return 'categorical';
    case 'scalar':
      return 'number';
    default:
      return 'string';
  }
};

/**
 * Add the entity attributes property to the property path of a sort rule.
*/
const propertyWithAttributePath = (rule) => {
  // 'type' rules are a special case - they exist in the protocol, but do not
  // refer to an entity attribute (they refer to a model property)
  if (rule.property === 'type') {
    return rule.property;
  }

  return [entityAttributesProperty, rule.property];
};

/**
 * Function that provides a compatibility layer between the old and new sort
 * systems.
 *
 * The old system provided a configurable "attribute path" that defaulted to
 * `entityAttributesProperty`. The new system requires the path to be specified
 * in full. This function appends the entity attributes property to the path.
 *
 * The old system also did not account for variable type in sort behaviour.
 * The new system uses a 'type' property to do this. This function maps the
 * variable type to the new type by looking up the variable definition in the
 * codebook.
 */
export const processProtocolSortRule = (codebookVariables) => (sortRule) => {
  const variableDefinition = get(codebookVariables, sortRule.property, null);

  // Don't modify the rule if there is no variable definition matching the
  // property.
  if (variableDefinition === null) {
    return sortRule;
  }

  const { type } = variableDefinition;

  return {
    ...sortRule,
    property: propertyWithAttributePath(sortRule),
    type: mapNCType(type),
    // Generate a hierarchy if the variable is ordinal based on the ordinal options
    ...type === 'ordinal' && { hierarchy: variableDefinition.options.map((option) => option.value) },
    ...type === 'categorical' && { hierarchy: variableDefinition.options.map((option) => option.value) },
  };
};

export default createSorter;

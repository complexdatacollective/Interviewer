import { get } from './lodash-replacements';

/**
 * Below is *heavily* inspired by this SO answer:
 * https://stackoverflow.com/questions/6913512/how-to-sort-an-array-of-objects-by-multiple-fields/72649463#72649463
 *
 */

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

/**
 * Creates a sort function that sorts items according to the index of their
 * property value in a hierarchy array.
 */
const hierarchyFunction = ({ property, direction, hierarchy = [] }) => (a, b) => {
  const firstValue = get(a, property);
  const secondValue = get(b, property);

  if (hierarchy.indexOf(firstValue) === -1) {
    return 1;
  }

  if (hierarchy.indexOf(secondValue) === -1) {
    return -1;
  }

  const firstIndex = hierarchy.indexOf(firstValue);
  const secondIndex = hierarchy.indexOf(secondValue);

  if (direction === 'asc') {
    if (firstIndex < secondIndex) {
      return 1;
    }

    if (firstIndex > secondIndex) {
      return -1;
    }

    return 0;
  }

  if (firstIndex > secondIndex) {
    return 1;
  }

  if (firstIndex < secondIndex) {
    return -1;
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
    type, // REQUIRED! number, boolean, string, date, hierarchy
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

  // eslint-disable-next-line no-console
  // console.warn('WARNING: Sort rule missing required property \'type\'. Sorting as a string, which may cause incorrect results. Supported types are: number, boolean, string, date, hierarchy.');
  return direction === 'asc' ? asc((item) => get(item, property, null)) : desc((item) => get(item, property, null));
};

const createSorter = (sortRules = []) => {
  const sortFunctions = sortRules.map(getSortFunction);
  return (items) => withoutCreatedIndex(withCreatedIndex(items).sort(chain(
    ...sortFunctions,
  )));
};

export default createSorter;

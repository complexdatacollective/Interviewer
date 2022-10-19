import { get } from './lodash-replacements';

/**
 * Below is *heavily* inspired by this SO answer:
 * https://stackoverflow.com/questions/6913512/how-to-sort-an-array-of-objects-by-multiple-fields/72649463#72649463
 *
 */

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
 */
const stringFunction = ({ property, direction }) => (a, b) => {
  const firstValue = get(a, property, null);
  const secondValue = get(b, property, null);

  if (firstValue === null) {
    return 1;
  }

  if (secondValue === null) {
    return -1;
  }

  if (direction === 'asc') {
    return -(firstValue < secondValue) || +(firstValue > secondValue);
  }

  return -(firstValue > secondValue) || +(firstValue < secondValue);
};

/**
 * Sort function for numbers that handles null/undefined values by placing them
 * at the end of the list.
 */
const numberFunction = ({ property, direction }) => {
  if (direction === 'asc') {
    return asc((item) => get(item, property, Infinity));
  }

  return desc((item) => get(item, property, -Infinity));
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
    type = 'string', // number, boolean, string, date, hierarchy
  } = rule;

  // LIFO/FIFO rule sorted by _createdIndex
  if (property === '*') {
    return direction === 'asc' ? asc((item) => get(item, '_createdIndex')) : desc((item) => get(item, '_createdIndex'));
  }

  if (type === 'string' || type === 'boolean') { return stringFunction(rule); }

  if (type === 'number') { return numberFunction(rule); }

  if (type === 'date') {
    if (direction === 'asc') {
      return asc((item) => get(item, property, new Date(-8640000000000000)));
    }

    return desc((item) => get(item, property, new Date(8640000000000000)));
  }

  if (type === 'hierarchy') { return hierarchyFunction(rule); }

  throw new Error(`Unknown sort type: ${type}`);
};

const createSorter = (sortRules = []) => {
  const sortFunctions = sortRules.map(getSortFunction);
  return (items) => withoutCreatedIndex(withCreatedIndex(items).sort(chain(
    ...sortFunctions,
  )));
};

export default createSorter;

/* eslint-disable import/prefer-default-export */
// import { get as lodashGet } from 'lodash';

/**
 * Helper function for verifying that a replacement is functioning the same as the original
 *
 * Usage:
 * export verify(myGet, lodashGet);
 *
 */
// eslint-disable-next-line no-unused-vars
const verify = (fn, otherFn) => (...args) => {
  const result = fn(...args);
  const otherResult = otherFn(...args);
  if (result !== otherResult) {
    // eslint-disable-next-line no-console
    console.log('return values do not match', result, otherResult);
    // eslint-disable-next-line no-debugger
    debugger;
  }
  return result;
};

const pathReducer = (acc, part) => {
  // If part is an array, call pathReducer on each element
  if (Array.isArray(part)) {
    return part.reduce(pathReducer, acc);
  }

  return acc?.[part];
};

// Replacement for lodash.get using optional chaining and nullish coalescing
export const getReplacement = (object, path, defaultValue = undefined) => {
  if (!object) { return defaultValue; }
  if (path === undefined || path === null) { return defaultValue; }

  // If path is a single number, attempt to use it as an array index
  if (typeof path === 'number') {
    return object?.[path] ?? defaultValue;
  }

  const parts = Array.isArray(path) ? path : path.split('.');

  return parts.reduce(pathReducer, object) ?? defaultValue;
};

export const get = getReplacement;

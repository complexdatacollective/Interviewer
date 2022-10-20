/* eslint-disable import/prefer-default-export */

const pathReducer = (acc, part) => {
  // If part is a number, attempt to use it as an array index
  if (!Number.isNaN(parseInt(part, 10))) {
    return acc?.[parseInt(part, 10)];
  }

  // If part is an array, call pathReducer on each element
  if (Array.isArray(part)) {
    return part.reduce(pathReducer, acc);
  }

  return acc?.[part];
};

// Replacement for lodash.get using optional chaining and nullish coalescing
export const get = (object, path, defaultValue = undefined) => {
  if (!object) { return defaultValue; }
  if (path === undefined || path === null) { return object; }

  // If path is a single number, attempt to use it as an array index
  if (typeof path === 'number') {
    return object?.[path] ?? defaultValue;
  }

  const parts = Array.isArray(path) ? path : path.split('.');

  return parts.reduce(pathReducer, object) ?? defaultValue;
};

/* eslint-disable import/prefer-default-export */

// Replacement for lodash.get using optional chaining and nullish coalescing
export const get = (object, path, defaultValue) => {
  if (!path) { return defaultValue; }

  if (Array.isArray(path)) {
    return path.reduce((obj, key) => obj?.[key], object) ?? defaultValue;
  }
  return path.split('.').reduce((acc, part) => acc?.[part], object) ?? defaultValue;
};

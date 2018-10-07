import { createSelectorCreator, defaultMemoize } from 'reselect';
import { isEqual } from 'lodash';

// create a "selector creator" that uses lodash.isEqual instead of ===
export const createDeepEqualSelector = createSelectorCreator(
  defaultMemoize,
  isEqual,
);

// If condition is not met, throws. When thrown from a selector, the error
// will be handled by stage boundary and displayed to the user.
export const assert = (condition, errorMessage) => {
  if (!condition) {
    throw new Error(errorMessage);
  }
};

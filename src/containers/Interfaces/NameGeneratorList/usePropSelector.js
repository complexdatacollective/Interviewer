import { useMemo, useCallback } from 'react';
import { useSelector } from 'react-redux';

/**
 * Converts legacy react-redux selectors that take a props argument
 * into ones that can be used with useSelector.
 *
 * Usage:
 *
 * const oldSelector = (state, props) => {};
 *
 * const results = usePropSelector(oldSelector, props);
 *
 * or for factory style selectors:
 *
 * const makeOldSelector = (config) => (state, props) => {};
 *
 * const results = usePropSelector(makeOldSelector, props, true);
 */
const usePropSelector = (selector, props, isFactory = false, equalityFn) => {
  const memoizedSelector = useMemo(() => {
    if (isFactory) { return selector(); }
    return selector;
  }, []);

  const selectorWithProps = useCallback(
    (state) => memoizedSelector(state, props),
    [props],
  );

  const state = useSelector(selectorWithProps, equalityFn);

  return state;
};

export default usePropSelector;

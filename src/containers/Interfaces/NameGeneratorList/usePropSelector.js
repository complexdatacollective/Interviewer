import { useMemo, useCallback } from 'react';
import { useSelector } from 'react-redux';

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

import { isNil } from 'lodash';
import {
  useEffect,
  useState,
  useRef,
  useCallback,
} from 'react';

// Hook that provides state that returns to a rest value after a delay
// Optionally has an initial value which can be different from the rest value
const useFlipflop = (restValue, delay, initialState) => {
  const timer = useRef(null);
  const [state, _setState] = useState(!isNil(initialState) ? initialState : restValue);

  const setState = useCallback((value) => {
    clearTimeout(timer.current);

    _setState(value);

    timer.current = setTimeout(() => {
      _setState(restValue);
    }, delay);
  }, [delay, restValue]);

  useEffect(() => {
    clearTimeout(timer.current);

    if (!isNil(initialState) && initialState !== restValue) {
      timer.current = setTimeout(() => {
        _setState(restValue);
      }, delay);
    }

    return () => {
      clearTimeout(timer.current);
    };
  }, [delay, restValue, initialState]);

  return [state, setState];
};

export default useFlipflop;

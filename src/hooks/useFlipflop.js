import {
  useEffect,
  useState,
  useRef,
  useCallback,
} from 'react';

const useFlipflop = (restValue, delay) => {
  const timer = useRef(null);
  const [state, _setState] = useState(restValue);

  const setState = useCallback((value) => {
    clearTimeout(timer.current);

    _setState(value);

    setTimeout(() => {
      _setState(restValue);
    }, delay);
  }, [delay, restValue]);

  useEffect(() => {
    clearTimeout(timer.current);
  }, [delay, restValue]);

  return [state, setState];
};

export default useFlipflop;

import { useRef, useEffect } from 'react';
import { debounce } from 'lodash';

const useDebouncedEffect = (func, wait, deps) => {
  const currentFunc = useRef(null);
  const debouncedFunc = useRef(debounce(() => { currentFunc.current(); }, wait));
  useEffect(() => {
    if (!currentFunc.current) { // skip first run
      currentFunc.current = func;
      return;
    }
    currentFunc.current = func;
    debouncedFunc.current();
  }, deps);
};

export default useDebouncedEffect;

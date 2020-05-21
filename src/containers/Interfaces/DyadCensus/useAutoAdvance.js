import { useEffect, useRef } from 'react';
import { getCSSVariableAsNumber } from '@codaco/ui/lib/utils/CSSVariables';

const useAutoAdvance = (next, isTouched, isChanged) => {
  const timer = useRef();
  const delay = getCSSVariableAsNumber('--animation-duration-standard-ms');

  // Auto advance
  useEffect(() => {
    if (isTouched) {
      if (timer.current) { clearTimeout(timer.current); }

      if (isChanged) {
        timer.current = setTimeout(next, delay);
      } else {
        next();
      }
    }

    return () => {
      if (!timer.current) { return; }
      clearTimeout(timer.current);
    };
  }, [isTouched]);
};

export default useAutoAdvance;

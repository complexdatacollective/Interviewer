import { useEffect, useRef } from 'react';

const useAutoAdvance = (next, isTouched, isChanged) => {
  const timer = useRef();

  // Auto advance
  useEffect(() => {
    if (isTouched) {
      if (timer.current) { clearTimeout(timer.current); }

      if (isChanged) {
        timer.current = setTimeout(next, 500);
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

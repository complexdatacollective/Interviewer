import { useEffect, useRef, useMemo } from 'react';
import { getCSSVariableAsNumber } from '@codaco/ui';

/**
 * Automatically advance stage when an option is selected.
 * If the option is changed, then wait a moment before advancing to
 * allow animations to be seen by the participant
 *
 * @param {function} next - The function to run when we advance
 * @param {boolean} isTouched - Whether or not an option has been selected
 * @param {boolean} isChanged - Whether or not the option has changed value
 */
const useAutoAdvance = (_next, isTouched, isChanged) => {
  const timer = useRef();
  const next = useRef();
  const delay = useMemo(() => getCSSVariableAsNumber('--animation-duration-standard-ms'), []);

  next.current = _next;

  // Auto advance
  useEffect(() => {
    if (isTouched) {
      if (timer.current) { clearTimeout(timer.current); }

      if (isChanged) {
        timer.current = setTimeout(next.current, delay);
      } else {
        next.current();
      }
    }

    return () => {
      if (!timer.current) { return () => { }; }
      return clearTimeout(timer.current);
    };
  }, [isTouched, delay, isChanged]);
};

export default useAutoAdvance;

import { useEffect, useRef } from 'react';
import { getCSSVariableAsNumber } from '@codaco/ui/lib/utils/CSSVariables';

/**
 * Automatically advance stage when an option is selected.
 * If the option is changed, then wait a moment before advancing to
 * allow animations to be seen by the participant
 *
 * @param {function} next - The function to run when we advance
 * @param {boolean} isTouched - Whether or not an option has been selected
 * @param {boolean} isChanged - Whether or not the option has changed value
 */
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

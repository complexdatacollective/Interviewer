import { useMemo } from 'react';
import {
  getCSSVariableAsNumber,
  getCSSVariableAsObject,
} from '@codaco/ui/lib/utils/CSSVariables';

const useAnimationSettings = () => {
  const animation = useMemo(() => {
    const veryFast = getCSSVariableAsNumber('--animation-duration-very-fast-ms') / 1000;
    const fast = getCSSVariableAsNumber('--animation-duration-fast-ms') / 1000;
    const standard = getCSSVariableAsNumber('--animation-duration-standard-ms') / 1000;
    const slow = getCSSVariableAsNumber('--animation-duration-slow-ms') / 1000;

    const easing = getCSSVariableAsObject('--animation-easing-js');

    return {
      duration: {
        veryFast,
        fast,
        standard,
        slow,
      },
      easing,
    };
  }, []);

  return animation;
};

export default useAnimationSettings;

import PropTypes from 'prop-types';
import { getCSSVariableAsObject, getCSSVariableAsNumber } from '@codaco/ui';

const Stage = ({ children, stageBackward, ...props }) => {
  const duration = {
    enter: getCSSVariableAsNumber('--animation-duration-slow-ms'),
    exit: getCSSVariableAsNumber('--animation-duration-slow-ms'),
  };

  const enterAnimation = (backward) => {
    const translateDistance = backward ? '-200vh' : '200vh';
    return {
      elasticity: 0,
      translateY: [translateDistance, 0],
      easing: getCSSVariableAsObject('--animation-easing-js'),
      duration: duration.enter,
      delay: duration.exit,
    };
  };

  const exitAnimation = (backward) => {
    const translateDistance = backward ? '200vh' : '-200vh';
    return {
      elasticity: 0,
      translateY: ['-100vh', translateDistance],
      easing: getCSSVariableAsObject('--animation-easing-js'),
      duration: duration.exit,
    };
  };

  console.warn('ReactTransitionGroup and anime removed. Stage needs to be updated.')

  return (
    <div
      {...props}
    >
      {children}
    </div>
  );
};

Stage.propTypes = {
  children: PropTypes.any,
  stageBackward: PropTypes.bool,
};

Stage.defaultProps = {
  children: null,
  stageBackward: false,
};

export default Stage;

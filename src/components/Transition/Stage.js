import React from 'react';
import PropTypes from 'prop-types';
import { Transition } from 'react-transition-group';
import anime from 'animejs';
import { getCSSVariableAsObject, getCSSVariableAsNumber } from '@codaco/ui/lib/utils/CSSVariables';

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

  return (
    <Transition
      {...props}
      timeout={duration}
      onEnter={
        (el) => {
          anime({
            targets: el,
            ...enterAnimation(stageBackward),
          });
        }
      }
      onExit={
        (el) => {
          anime({
            targets: el,
            ...exitAnimation(stageBackward),
          });
        }
      }
      appear
      unmountOnExit
    >
      { children }
    </Transition>
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

import React from 'react';
import PropTypes from 'prop-types';
import { Transition } from 'react-transition-group';
import anime from 'animejs';
import { getCSSVariableAsObject, getCSSVariableAsNumber } from '../../utils/CSSVariables';

const duration = {
  enter: getCSSVariableAsNumber('--animation-duration-standard-ms'),
  exit: getCSSVariableAsNumber('--animation-duration-standard-ms'),
};

const enterAnimation = {
  opacity: [0, 1],
  zIndex: [2, 2],
  elasticity: 0,
  translateY: ['200%', 0],
  easing: getCSSVariableAsObject('--animation-easing-js'),
  duration: duration.enter,
  delay: duration.exit,
};

const exitAnimation = {
  opacity: [1, 0],
  zIndex: [1, 1],
  elasticity: 0,
  translateY: [0, '-200%'],
  easing: getCSSVariableAsObject('--animation-easing-js'),
  duration: duration.exit,
};

const Stage = ({ children, ...props }) => (
  <Transition
    {...props}
    timeout={duration}
    onEnter={
      (el) => {
        anime({
          targets: el,
          ...enterAnimation,
        });
      }
    }
    onExit={
      (el) => {
        anime({
          targets: el,
          ...exitAnimation,
        });
      }
    }
    appear
    unmountOnExit
  >
    { children }
  </Transition>
);

Stage.propTypes = {
  children: PropTypes.any.isRequired,
};

Stage.defaultProps = {
  children: null,
};

export default Stage;

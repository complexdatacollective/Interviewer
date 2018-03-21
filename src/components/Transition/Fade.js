import React from 'react';
import PropTypes from 'prop-types';
import { Transition } from 'react-transition-group';
import anime from 'animejs';
import { getCSSVariableAsObject, getCSSVariableAsNumber } from '../../utils/CSSVariables';

const duration = {
  enter: getCSSVariableAsNumber('--animation-duration-fast-ms'),
  exit: getCSSVariableAsNumber('--animation-duration-fast-ms'),
};

const enterAnimation = {
  opacity: [0, 1],
  elasticity: 0,
  easing: getCSSVariableAsObject('--animation-easing-js'),
  duration: duration.enter,
};

const exitAnimation = {
  opacity: [1, 0],
  elasticity: 0,
  easing: getCSSVariableAsObject('--animation-easing-js'),
  duration: duration.exit,
};

const Fade = ({ children, ...props }) => (
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

Fade.propTypes = {
  children: PropTypes.any.isRequired,
};

Fade.defaultProps = {
  children: null,
};

export default Fade;

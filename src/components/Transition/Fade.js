import React from 'react';
import PropTypes from 'prop-types';
import { Transition } from 'react-transition-group';
import anime from 'animejs';
import { getCSSVariableAsObject, getCSSVariableAsNumber } from '../../utils/CSSVariables';

const durationFast = {
  enter: getCSSVariableAsNumber('--animation-duration-fast-ms'),
  exit: getCSSVariableAsNumber('--animation-duration-fast-ms'),
};

const durationSlow = {
  enter: getCSSVariableAsNumber('--animation-duration-slow-ms'),
  exit: getCSSVariableAsNumber('--animation-duration-slow-ms'),
};

const enterAnimation = duration => ({
  opacity: [0, 1],
  elasticity: 0,
  easing: getCSSVariableAsObject('--animation-easing-js'),
  duration: duration.enter,
});

const exitAnimation = duration => ({
  opacity: [1, 0],
  elasticity: 0,
  easing: getCSSVariableAsObject('--animation-easing-js'),
  duration: duration.exit,
});

const Fade = ({ children, isSlow, ...props }) => (
  <Transition
    {...props}
    timeout={isSlow ? durationSlow : durationFast}
    onEnter={
      (el) => {
        anime({
          targets: el,
          ...enterAnimation(isSlow ? durationSlow : durationFast),
        });
      }
    }
    onExit={
      (el) => {
        anime({
          targets: el,
          ...exitAnimation(isSlow ? durationSlow : durationFast),
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
  isSlow: PropTypes.bool,
};

Fade.defaultProps = {
  children: null,
  isSlow: false,
};

export default Fade;

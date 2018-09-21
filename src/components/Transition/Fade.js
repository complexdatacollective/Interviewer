import React from 'react';
import PropTypes from 'prop-types';
import { Transition } from 'react-transition-group';
import anime from 'animejs';
import { getCSSVariableAsObject, getCSSVariableAsNumber } from '../../utils/CSSVariables';

const defaultDuration = {
  enter: getCSSVariableAsNumber('--animation-duration-fast-ms'),
  exit: getCSSVariableAsNumber('--animation-duration-fast-ms'),
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

const Fade = ({ children, duration, ...props }) => (
  <Transition
    {...props}
    timeout={duration}
    onEnter={
      (el) => {
        anime({
          targets: el,
          ...enterAnimation(duration),
        });
      }
    }
    onExit={
      (el) => {
        anime({
          targets: el,
          ...exitAnimation(duration),
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
  duration: PropTypes.object,
};

Fade.defaultProps = {
  children: null,
  duration: defaultDuration,
};

export default Fade;

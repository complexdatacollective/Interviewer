import React from 'react';
import PropTypes from 'prop-types';
import { Transition } from 'react-transition-group';
import { animation } from 'network-canvas-ui';
import anime from 'animejs';

const duration = {
  enter: animation.duration.fast,
  exit: animation.duration.fast,
};

const enterAnimation = {
  opacity: [0, 1],
  elasticity: 0,
  easing: animation.easing.default,
  duration: duration.enter,
};

const exitAnimation = {
  opacity: [1, 0],
  elasticity: 0,
  easing: animation.easing.default,
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

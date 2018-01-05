import React from 'react';
import PropTypes from 'prop-types';
import { Transition } from 'react-transition-group';
import { animation } from 'network-canvas-ui';
import anime from 'animejs';

const duration = {
  enter: animation.duration.standard,
  exit: 1,
};

const enterAnimation = {
  opacity: [0, 1],
  elasticity: 0,
  easing: 'easeOutElastic',
  duration: duration.enter,
};

const exitAnimation = {
  opacity: [1, 0],
  elasticity: 0,
  easing: 'easeOutElastic',
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
          elasticity: 0,
          easing: 'easeOutElastic',
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

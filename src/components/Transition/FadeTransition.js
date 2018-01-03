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

const FadeTransition = ({ children, ...props }) => (
  <Transition
    timeout={duration}
    onEntering={
      (el) => {
        anime({
          targets: el,
          elasticity: 0,
          easing: 'easeOutElastic',
          ...enterAnimation,
        });
      }
    }
    onExiting={
      (el) => {
        anime({
          targets: el,
          ...exitAnimation,
        });
      }
    }
    {...props}
  >
    { children }
  </Transition>
);

FadeTransition.propTypes = {
  children: PropTypes.any.isRequired,
};

FadeTransition.defaultProps = {
  children: null,
};

export default FadeTransition;

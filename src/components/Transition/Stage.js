import React from 'react';
import PropTypes from 'prop-types';
import { Transition } from 'react-transition-group';
import { animation } from 'network-canvas-ui';
import anime from 'animejs';

const duration = {
  enter: animation.duration.standard,
  exit: animation.duration.standard,
};

const enterAnimation = {
  opacity: [0, 1],
  zIndex: [2, 2],
  elasticity: 0,
  easing: animation.easing.default,
  duration: duration.enter,
  delay: duration.exit,
};

const exitAnimation = {
  opacity: [1, 0],
  zIndex: [1, 1],
  elasticity: 0,
  easing: animation.easing.default,
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

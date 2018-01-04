import React from 'react';
import PropTypes from 'prop-types';
import { Transition } from 'react-transition-group';
import { animation } from 'network-canvas-ui';
import anime from 'animejs';

const duration = {
  enter: animation.duration.slow,
  exit: animation.duration.slow,
};

const enterAnimation = {
  opacity: [0, 1],
  zIndex: [100, 100],
  elasticity: 0,
  easing: 'easeOutElastic',
  duration: duration.enter,
  delay: duration.exit,
};

const exitAnimation = {
  opacity: [1, 0],
  zIndex: [0, 0],
  elasticity: 0,
  easing: 'easeOutElastic',
  duration: duration.exit,
};

const StageTransition = ({ children, ...props }) => (
  <Transition
    {...props}
    timeout={duration}
    onEnter={
      (el) => {
        console.log('ENTERING');
        anime({
          targets: el,
          ...enterAnimation,
        });
      }
    }
    onExit={
      (el) => {
        console.log('EXITING');
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

StageTransition.propTypes = {
  children: PropTypes.any.isRequired,
};

StageTransition.defaultProps = {
  children: null,
};

export default StageTransition;

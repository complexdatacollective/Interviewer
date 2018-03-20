import React from 'react';
import PropTypes from 'prop-types';
import { Transition } from 'react-transition-group';
import anime from 'animejs';
import getCSSVariable from '../../utils/CSSVariables';

const duration = {
  enter: parseInt(getCSSVariable('--animation-duration-standard-ms'), 10),
  exit: parseInt(getCSSVariable('--animation-duration-standard-ms'), 10),
};

const enterAnimation = {
  opacity: [0, 1],
  zIndex: [2, 2],
  elasticity: 0,
  easing: getCSSVariable('--animation-easing'),
  duration: duration.enter,
  delay: duration.exit,
};

const exitAnimation = {
  opacity: [1, 0],
  zIndex: [1, 1],
  elasticity: 0,
  easing: getCSSVariable('--animation-easing'),
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

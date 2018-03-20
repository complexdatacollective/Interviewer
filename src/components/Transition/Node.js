import React from 'react';
import PropTypes from 'prop-types';
import { Transition } from 'react-transition-group';
import anime from 'animejs';
import getCSSVariable from '../../utils/CSSVariables';

const animationThreshold = 20;

const duration = {
  enter: parseInt(getCSSVariable('--animation-duration-standard-ms'), 10),
  exit: parseInt(getCSSVariable('--animation-duration-fast-ms'), 10),
};

const enterAnimation = {
  opacity: [0, 1],
  translateY: ['50%', 0],
  easing: 'easeOutElastic',
  duration: duration.enter,
};

const exitAnimation = {
  opacity: [1, 0],
  scale: [1, 0],
  easing: JSON.parse(getCSSVariable('--animation-easing-js')),
  duration: duration.exit,
};

const Node = ({ children, index, stagger, ...props }) => {
  const delay = stagger ? index * 30 : 0;

  return (
    <Transition
      {...props}
      timeout={duration}
      onEnter={
        (el) => {
          // dirty performance hack
          if (!stagger || index < animationThreshold) {
            anime({
              targets: el,
              delay,
              ...enterAnimation,
            });
          }
        }
      }
      onExit={
        (el) => {
          // dirty performance hack
          if (index < animationThreshold) {
            anime({
              targets: el,
              ...exitAnimation,
            });
          } else {
            el.setAttribute('style', 'display: none;');
          }
        }
      }
      mountOnEnter={false}
      unmountOnExit
    >
      { children }
    </Transition>
  );
};

Node.propTypes = {
  children: PropTypes.any.isRequired,
  index: PropTypes.number,
  stagger: PropTypes.bool,
};

Node.defaultProps = {
  children: null,
  index: 0,
  stagger: false,
};

export default Node;

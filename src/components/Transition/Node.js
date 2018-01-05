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
  translateY: ['50%', 0],
  easing: 'easeOutElastic',
  duration: duration.enter,
};

const exitAnimation = {
  opacity: [1, 0],
  scale: [1, 0],
  easing: animation.easing.default,
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
          if (index < 10) {
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
          if (index < 10) {
            anime({
              targets: el,
              ...exitAnimation,
            });
          } else {
            el.setAttribute('style', 'display: none;');
          }
        }
      }
      appear
      mountOnEnter
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

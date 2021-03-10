import React from 'react';
import PropTypes from 'prop-types';
import { Transition } from 'react-transition-group';
import anime from 'animejs';
import { getCSSVariableAsObject, getCSSVariableAsNumber } from '@codaco/ui/lib/utils/CSSVariables';

const Node = ({
  children, index, stagger, ...props
}) => {
  const delay = stagger ? index * 30 : 0;

  const animationThreshold = 20;

  const duration = {
    enter: getCSSVariableAsNumber('--animation-duration-standard-ms'),
    exit: getCSSVariableAsNumber('--animation-duration-fast-ms'),
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
    easing: getCSSVariableAsObject('--animation-easing-js'),
    duration: duration.exit,
  };

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
  children: PropTypes.any,
  index: PropTypes.number,
  stagger: PropTypes.bool,
};

Node.defaultProps = {
  children: null,
  index: 0,
  stagger: false,
};

export default Node;

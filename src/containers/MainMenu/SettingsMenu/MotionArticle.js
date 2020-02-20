import React from 'react';
import { Transition } from 'react-transition-group';
import anime from 'animejs';
import { getCSSVariableAsObject, getCSSVariableAsNumber } from '@codaco/ui/lib/utils/CSSVariables';

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


const MotionArticle = props => (
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
    mountOnEnter={false}
    unmountOnExit
  >
    {props.children}
  </Transition>
);

export default MotionArticle;

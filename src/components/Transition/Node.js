import React from 'react';
import PropTypes from 'prop-types';
import { Transition } from 'react-transition-group';
import { animation } from 'network-canvas-ui';
import anime from 'animejs';

const animationThreshold = 20;

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

  // The enter timeline typically consists of two stages:
  //   1. (During exit transition): newNodes are hidden (position:absolute and opacity:0)
  //   2. Visible transition of newNodes, which begins only after exit has finished
  // However, if the previous nodes have their exit transition disabled, then
  // `waitForPreviousExit` will indicate that the first stage should be skipped.
  return (
    <Transition
      {...props}
      timeout={duration}
      onEnter={
        (el) => {
          // dirty performance hack
          if (!stagger || index < animationThreshold) {
            const timeline = anime.timeline({ autoplay: false });

            if (props.waitForPreviousExit) {
              // Pad time between the timeline stages, allowing for
              // re-layout in response to position change
              const positionAdjustmentDelay = 30;
              const oldPositionStyle = el.style.position;
              el.setAttribute('style', 'position: absolute');
              timeline
                .add({
                  targets: el,
                  duration: duration.exit + positionAdjustmentDelay,
                  delay: 0,
                  complete: () => {
                    el.setAttribute('style', `position: ${oldPositionStyle}`);
                  },
                });
            }

            timeline.add({
              targets: el,
              delay,
              ...enterAnimation,
            });

            timeline.play();
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
  waitForPreviousExit: PropTypes.bool,
};

Node.defaultProps = {
  children: null,
  index: 0,
  stagger: false,
  waitForPreviousExit: true,
};

export default Node;

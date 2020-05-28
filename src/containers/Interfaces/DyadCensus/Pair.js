import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import Node from '../../../containers/Node';

const animationOffset = 200;
const animationTarget = -50;

export const getPairVariants = () => {

  const pairTransition = {
    duration: 0.5,
    delay: 0.35,
    when: 'afterChildren',
  };

  const translateUp = `${animationTarget - animationOffset}%`;
  const translateDown = `${animationTarget + animationOffset}%`;
  const translateTarget = `${animationTarget}%`;

  return {
    initial: ([isForwards]) => ({
      translateY: isForwards ? translateDown : translateUp,
      translateX: '-50%',
      opacity: 0,
      transition: pairTransition,
    }),
    show: () => ({
      translateY: translateTarget,
      translateX: '-50%',
      opacity: 1,
      transition: pairTransition,
    }),
    hide: ([isForwards]) => ({
      translateY: !isForwards ? translateDown : translateUp,
      translateX: '-50%',
      opacity: 0,
      transition: pairTransition,
    }),
  };
};

const Pair = ({
  fromNode,
  toNode,
  edgeColor,
  hasEdge,
  animateForwards,
}) => {
  const pairVariants = getPairVariants();

  const edgeVariants = {
    show: { backgroundPosition: 'right bottom' },
    hide: { backgroundPosition: 'left bottom' },
  };

  return (
    <motion.div
      className="dyad-interface__pair"
      custom={[animateForwards]}
      variants={pairVariants}
      initial="initial"
      animate="show"
      exit="hide"
    >
      <div className="dyad-interface__nodes">
        <Node {...fromNode} />
        <motion.div
          className="dyad-interface__edge"
          style={{ backgroundColor: `var(--${edgeColor})` }}
          variants={edgeVariants}
          initial="hide"
          animate={!hasEdge ? 'show' : 'hide'}
        />
        <Node {...toNode} />
      </div>
    </motion.div>
  );
};

Pair.propTypes = {
  fromNode: PropTypes.any.isRequired,
  toNode: PropTypes.any.isRequired,
  edgeColor: PropTypes.string.isRequired,
  hasEdge: PropTypes.bool,
  animateForwards: PropTypes.bool,
};

Pair.defaultProps = {
  hasEdge: false,
  animateForwards: true,
};

export default Pair;

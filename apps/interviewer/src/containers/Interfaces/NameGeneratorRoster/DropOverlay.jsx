import React from 'react';
import { motion } from 'framer-motion';
import { Node as UINode } from '@codaco/ui';

const variants = {
  visible: { opacity: 1 },
  hidden: { opacity: 0 },
};

const iconVariants = {
  over: {
    scale: [0, 1],
    transition: {
      type: 'spring',
    },
  },
  initial: {
    scale: 1,
    y: [0, 7, 0, 7, 0],
    transition: {
      duration: 2,
      loop: Infinity,
      ease: 'easeInOut',
    },
  },
};

const DropOverlay = ({ isOver, nodeColor, message }) => (
  <motion.div
    className="name-generator-roster-interface__overlay"
    variants={variants}
    initial="hidden"
    animate="visible"
    exit="hidden"
  >
    <motion.div
      variants={iconVariants}
      animate={isOver ? 'over' : 'initial'}
    >
      <UINode label="" color={nodeColor} />
    </motion.div>
    <h2>{message}</h2>
  </motion.div>
);

export default DropOverlay;

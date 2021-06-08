import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { MarkdownLabel } from '@codaco/ui/lib/components/Fields';

/**
  * Renders a single prompt.
  */
const Prompt = (props) => {
  const {
    promptIndex,
    label,
    direction,
  } = props;

  const variants = {
    enter: (enterDirection = 1) => ({
      x: enterDirection > 0 ? 400 : -400,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (exitDirection = 1) => ({
      x: exitDirection < 0 ? 400 : -400,
      opacity: 0,
    }),
  };

  return (
    <motion.div
      key={promptIndex}
      variants={variants}
      className="prompts__prompt"
      custom={direction}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{
        x: { type: 'spring', stiffness: 600, damping: 35 },
        opacity: { duration: 0.2 },
      }}
    >
      <MarkdownLabel label={label} inline className="prompts__prompt-header" />
    </motion.div>
  );
};

Prompt.propTypes = {
  promptIndex: PropTypes.number,
  label: PropTypes.string,
  direction: PropTypes.number,
};

Prompt.defaultProps = {
  promptIndex: 0,
  label: '',
  direction: 1,
};

export default Prompt;

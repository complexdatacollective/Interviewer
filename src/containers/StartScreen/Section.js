import React from 'react';
import { motion } from 'framer-motion';

const Section = (props) => {
  const {
    children,
    className,
    ...rest
  } = props;

  const itemVariants = {
    show: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        when: 'beforeChildren',
      },
    },
    hide: {
      y: '10rem',
      opacity: 0,
    },
  };

  return (
    <motion.section
      className={className}
      variants={itemVariants}
      {...rest}
    >
      {children}
    </motion.section>
  );
};

export default Section;

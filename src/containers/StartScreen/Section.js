import React from 'react';
import { motion } from 'framer-motion';

const Section = (props) => {
  const {
    children,
    className,
    ...rest
  } = props;

  const springy = {
    visible: {
      opacity: 1,
      transition: {
        duration: 1,
        when: 'beforeChildren',
        staggerChildren: 0.5,
      },
    },
    hidden: {
      opacity: 0,
      transition: {
        when: 'afterChildren',
      },
    },
  };

  return (
    <motion.section
      className={className}
      variants={springy}
      layout
      {...rest}
    >
      {children}
    </motion.section>
  );
};

Section.propTypes = {
};

Section.defaultProps = {
};

export default Section;

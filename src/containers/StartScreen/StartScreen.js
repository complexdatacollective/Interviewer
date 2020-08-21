import React from 'react';
import { motion, AnimateSharedLayout } from 'framer-motion';
import { connect } from 'react-redux';

import {
  HeaderSection,
  InterviewSection,
  ImportSection,
  ServerSection,
} from '.';

const StartScreen = () => {
  const opacity = {
    visible: {
      opacity: 1,
      transition: {
        when: 'beforeChildren',
        staggerChildren: 0.15,
      },
    },
    hidden: {
      opacity: 0,
    },
  };

  return (
    <div className="start-screen">
      <AnimateSharedLayout>
        <motion.div
          className="start-screen__container"
          initial="hidden"
          animate="visible"
          variants={opacity}
        >
          <HeaderSection />
          <InterviewSection />
          <ImportSection />
          <ServerSection />
        </motion.div>
      </AnimateSharedLayout>
    </div>
  );
};

StartScreen.defaultProps = {
};

StartScreen.propTypes = {

};

const mapDispatchToProps = {

};

const mapStateToProps = () => ({
});

export default connect(mapStateToProps, mapDispatchToProps)(StartScreen);

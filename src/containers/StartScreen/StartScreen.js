import React from 'react';
import { motion, AnimateSharedLayout } from 'framer-motion';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';


import {
  ResumeSessionSection,
  HeaderSection,
  InterviewSection,
  // ProtocolsOverlay,
  // SessionsOverlay,
} from '.';

const StartScreen = (props) => {


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
          <ResumeSessionSection />
          <motion.section layout className="start-screen-section server-section">
            <main>
              <header>
                <h2>Server</h2>
              </header>
            </main>
          </motion.section>
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

const mapStateToProps = (state, ownProps) => {
  return {
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(StartScreen);

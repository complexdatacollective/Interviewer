import React from 'react';
import { motion, AnimateSharedLayout } from 'framer-motion';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import {
  HeaderSection,
  InterviewSection,
  ImportSection,
  ServerSection,
} from '.';
import WhatsNewSection from './WhatsNewSection';
import DataExportSection from './DataExportSection';


const StartScreen = ({
  activeSessionId,
  sessions,
}) => {
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

  if (activeSessionId) {
    const stageIndex = sessions[activeSessionId].stageIndex;
    const pathname = `/session/${activeSessionId}/${stageIndex}`;
    return (<Redirect to={{ pathname: `${pathname}` }} />);
  }

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
          <WhatsNewSection />
          <InterviewSection />
          <ImportSection />
          <DataExportSection />
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

const mapStateToProps = state => ({
  activeSessionId: state.activeSessionId,
  sessions: state.sessions,

});

export default connect(mapStateToProps, mapDispatchToProps)(StartScreen);

import { motion } from 'framer-motion';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import HeaderSection from './HeaderSection';
import InterviewSection from './InterviewSection';
import ImportSection from './ImportSection';
import WhatsNewSection from './WhatsNewSection';
import SessionManagementSection from './SessionManagementSection';
import TestSection from './TestSection';

const StartScreen = () => {
  const activeSessionId = useSelector((state) => state.activeSessionId);
  const sessions = useSelector((state) => state.sessions);


  const variants = {
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.32, when: 'beforeChildren' },
    },
    hide: {
      opacity: 0,
    },
  };

  if (activeSessionId) {
    const { stageIndex } = sessions[activeSessionId];
    const pathname = `/session/${activeSessionId}/${stageIndex}`;
    return (<Navigate replace to={pathname} />);
  }

  return (
    <div className="start-screen">
      <motion.div
        className="start-screen__container"
        variants={variants}
        animate="show"
        initial="hide"
        key="start-screen"
      >
        <HeaderSection />
        <TestSection />
        <WhatsNewSection />
        {/* <InterviewSection /> */}
        {/* <SessionManagementSection /> */}
        {/* <ImportSection /> */}
      </motion.div>
    </div>
  );
};

export default StartScreen;

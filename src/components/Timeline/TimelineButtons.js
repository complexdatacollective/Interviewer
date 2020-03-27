import React from 'react';
import { Icon } from '@codaco/ui';
import { motion, useInvertedScale } from 'framer-motion';
import { ProgressBar } from '../';

const TimelineButtons = (props) => {
  const {
    onClickBack,
    onClickNext,
    percentProgress,
    setExpanded,
    setShowSubMenu,
  } = props;

  const { scaleX, scaleY } = useInvertedScale();

  const variants = {
    normal: {
      opacity: 1,
    },
    expanded: {
      opacity: 0,
    },
  };

  return (
    <motion.div
      key="menu"
      variants={variants}
      initial="expanded"
      exit="expanded"
      animate="normal"
      className="timeline-content"
      useInvertedScale
      style={{ scaleX, scaleY }}
    >
      {/* <SettingsMenu /> */}

      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="timeline-nav"
        onClick={() => {
          setShowSubMenu(true);
          setExpanded(true);
        }}
      >
        <Icon name="menu" />
      </motion.div>
      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="timeline-nav timeline-nav--back"
      >
        <Icon
          onClick={(e) => {
            if (e) {
              e.stopPropagation();
              e.preventDefault();
            }
            onClickBack(e);
          }}
          name="chevron-up"
        />
      </motion.div>
      <motion.div
        className="timeline-progress-bar"
        onClick={() => setExpanded(prevState => !prevState)}
      >
        <ProgressBar
          percentProgress={percentProgress}
        />
      </motion.div>
      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="timeline-nav timeline-nav--next"
        onClick={(e) => {
          if (e) {
            e.stopPropagation();
            e.preventDefault();
          }
          onClickNext(e);
        }}
      >
        <Icon name="chevron-down" />
      </motion.div>
    </motion.div>
  );
};

export default TimelineButtons;

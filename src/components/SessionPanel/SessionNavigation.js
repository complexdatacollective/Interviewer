import React from 'react';
import PropTypes from 'prop-types';
import { Icon } from '@codaco/ui';
import { motion, useInvertedScale } from 'framer-motion';
import { ProgressBar } from '..';

const SessionNavigation = (props) => {
  const {
    onClickBack,
    onClickNext,
    percentProgress,
    setExpanded,
    isExpanded,
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
      key="session-navigation"
      variants={variants}
      initial="expanded"
      exit="expanded"
      animate={isExpanded ? 'expanded' : 'normal'}
      className="session-navigation"
      useInvertedScale
      style={{ scaleX, scaleY }}
    >
      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="session-navigation__button"
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
        className="session-navigation__button session-navigation__button--back"
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
        className="session-navigation__progress-bar"
        onClick={() => { setShowSubMenu(false); setExpanded(true); }}
      >
        <ProgressBar
          percentProgress={percentProgress}
        />
      </motion.div>
      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="session-navigation__button session-navigation__button--next"
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

SessionNavigation.propTypes = {
  onClickNext: PropTypes.func.isRequired,
  onClickBack: PropTypes.func.isRequired,
  percentProgress: PropTypes.number.isRequired,
  setExpanded: PropTypes.func.isRequired,
  isExpanded: PropTypes.bool.isRequired,
  setShowSubMenu: PropTypes.func.isRequired,
};

export default SessionNavigation;

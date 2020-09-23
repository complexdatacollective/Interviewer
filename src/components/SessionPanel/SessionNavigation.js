import React from 'react';
import PropTypes from 'prop-types';
import { Icon, ProgressBar } from '@codaco/ui';
import { AnimateSharedLayout, motion } from 'framer-motion';

const SessionNavigation = (props) => {
  const {
    onClickBack,
    onClickNext,
    percentProgress,
    setExpanded,
    setShowSubMenu,
  } = props;

  const variants = {
    normal: {
      opacity: 1,
      transition: {
        delay: 0.5,
      },
    },
    expanded: {
      opacity: 0,
    },
  };

  return (
    <AnimateSharedLayout>
      <motion.div
        key="session-navigation"
        variants={variants}
        initial="expanded"
        exit="expanded"
        animate="normal"
        className="session-navigation"
        layout
      >
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="session-navigation__button session-navigation__button--menu"
          onClick={() => {
            setShowSubMenu(true);
            setExpanded(true);
          }}
          layout
        >
          <Icon name="menu" />
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="session-navigation__button session-navigation__button--back"
          onClick={(e) => {
            if (e) {
              e.stopPropagation();
              e.preventDefault();
            }
            onClickBack(e);
          }}
          layout
        >
          <Icon
            name="chevron-up"
          />
        </motion.div>
        <motion.div
          className="session-navigation__progress-bar"
          onClick={() => { setShowSubMenu(false); setExpanded(true); }}
          layout
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
          layout
        >
          <Icon name="chevron-down" />
        </motion.div>
      </motion.div>
    </AnimateSharedLayout>
  );
};

SessionNavigation.propTypes = {
  onClickNext: PropTypes.func.isRequired,
  onClickBack: PropTypes.func.isRequired,
  percentProgress: PropTypes.number.isRequired,
  setExpanded: PropTypes.func.isRequired,
  setShowSubMenu: PropTypes.func.isRequired,
};

export default SessionNavigation;

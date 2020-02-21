import React, { useState } from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { Icon } from '@codaco/ui';
import { motion, AnimatePresence } from 'framer-motion';
import { getCSSVariableAsNumber } from '@codaco/ui/lib/utils/CSSVariables';
import { ProgressBar } from '../components';
import { DropObstacle } from '../behaviours/DragAndDrop';
import { actionCreators as uiActions } from '../ducks/modules/ui';
import { SettingsMenu, StagesMenu } from '../containers/MainMenu';

const containerVariants = {
  normal: {
    x: 0,
    background: 'var(--panel-bg-muted)',
    transition: {
      when: 'afterChildren',
      staggerChildren: 0.05,
      staggerDirection: -1,
      duration: 0.2,
    },
  },
  expanded: {
    x: '20rem',
    background: 'var(--color-slate-blue)',
    transition: {
      when: 'beforeChildren',
      staggerChildren: 0.05,
      delayChildren: 0.2,
      duration: 0.2,
      delay: 0.2,
    },
  },
};

const variants = {
  normal: {
    opacity: 1,
    transition: {
      // when: 'beforeChildren',
      // staggerChildren: 0.05,
      // delayChildren: 0.2,
      duration: 0.2,
    },
  },
  expanded: {
    opacity: 0,
    transition: {
      // when: 'afterChildren',
      // staggerChildren: 0.05,
      // staggerDirection: -1,
      duration: 0.2,
    },
  },
};

const Timeline = (props) => {
  const {
    onClickBack,
    onClickNext,
    percentProgress,
  } = props;

  const [expanded, toggleExpanded] = useState(false);

  return (
    <React.Fragment>
      <motion.div
        className="timeline"
        key="timeline"
        variants={containerVariants}
        initial="normal"
        animate={expanded ? 'expanded' : 'normal'}
        onClick={() => toggleExpanded(prevState => !prevState)}
      >
        <AnimatePresence exitBeforeEnter>
          { expanded && (<StagesMenu expanded={expanded} toggleExpanded={toggleExpanded} animationVariants={variants} />) }
          { !expanded && (
            <motion.div
              key="menu"
              variants={variants}
              initial="normal"
              exit="expanded"
              animate="normal"
              className="timeline-content"
            >
              <SettingsMenu />
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
              <ProgressBar
                percentProgress={percentProgress}
                key={expanded}
              />
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
          )}
        </AnimatePresence>
      </motion.div>
    </React.Fragment>
  );
};

const mapDispatchToProps = dispatch => ({
  toggleMenu: () => dispatch(uiActions.toggle('isMenuOpen')),
});

export { Timeline };

export default compose(
  connect(null, mapDispatchToProps),
  DropObstacle,
)(Timeline);

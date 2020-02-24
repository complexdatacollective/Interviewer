import React, { useState } from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { Icon } from '@codaco/ui';
import { motion, AnimatePresence, useInvertedScale } from 'framer-motion';
import { getCSSVariableAsNumber } from '@codaco/ui/lib/utils/CSSVariables';
import { ProgressBar } from '../components';
import { DropObstacle } from '../behaviours/DragAndDrop';
import { actionCreators as uiActions } from '../ducks/modules/ui';
import { SettingsMenu, StagesMenu } from '../containers/MainMenu';
import CloseButton from '../containers/MainMenu/CloseButton';

const containerVariants = {
  normal: {
    // background: 'var(--panel-bg-muted)',
  },
  expanded: {
    // background: 'var(--light-background)',

  },
};

const TimelineNavigation = (props) => {
  const {
    onClickBack,
    onClickNext,
    percentProgress,
    toggleExpanded,
  } = props;

  const { scaleX, scaleY } = useInvertedScale();

  const variants = {
    normal: {
      opacity: 1,
      transition: {
        duration: 1,
      },
    },
    expanded: {
      opacity: 0,
      transition: {
        duration: 1,
      },
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
        onClick={() => toggleExpanded(prevState => !prevState)}
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
  );
};

const Dimmer = (props) => {
  const slowDuration = getCSSVariableAsNumber('--animation-duration-slow-ms') / 1000;

  const variants = {
    normal: {
      opacity: 1,
      transition: {
        duration: slowDuration,
      },
    },
    expanded: {
      opacity: 0,
      transition: {
        duration: slowDuration,
      },
    },
  };

  return (
    <motion.div
      key="dimmer"
      variants={variants}
      className="dimmer"
      initial="expanded"
      exit="expanded"
      animate="normal"
      onClick={() => props.toggleExpanded(prevState => !prevState)}
    >
      <CloseButton />
    </motion.div>
  );
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
      <AnimatePresence>
        { expanded && (<Dimmer toggleExpanded={toggleExpanded} />)}
      </AnimatePresence>
      <motion.div
        className="timeline"
        key="timeline"
        variants={containerVariants}
        initial="normal"
        animate={expanded ? 'expanded' : 'normal'}
        layoutTransition
        transition={{
          duration: 0.5,
        }}
      >
        <AnimatePresence initial={false} exitBeforeEnter>
          { !expanded && (<TimelineNavigation toggleExpanded={toggleExpanded} />)}
          { expanded && (<StagesMenu />) }
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

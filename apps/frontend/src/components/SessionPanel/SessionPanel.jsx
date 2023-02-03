import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import { motion, AnimatePresence, AnimateSharedLayout } from 'framer-motion';
import { DropObstacle } from '../../behaviours/DragAndDrop';
import StagesMenu from '../StagesMenu/StagesMenu';
import SubMenu from './SubMenu';
import BackgroundDimmer from '../BackgroundDimmer';
import SessionNavigation from './SessionNavigation';
import CloseButton from '../CloseButton';
import SessionInformation from './SessionInformation';

const choiceVariants = {
  show: {
    opacity: 1,
    translateY: '0%',
    transition: {
      type: 'spring', damping: 15, stiffness: 200, delay: 0.25,
    },
  },
  hide: { opacity: 0, translateY: '100%', transition: { duration: 0.3 } },
};

const SessionPanel = React.forwardRef((props, ref) => {
  const [expanded, setExpanded] = useState(false);
  const [showSubMenu, setShowSubMenu] = useState(false);

  const resetMenuState = () => {
    setExpanded(false);
    setShowSubMenu(false);
  };

  const menuContent = showSubMenu
    ? <SubMenu setShowSubMenu={setShowSubMenu} setExpanded={setExpanded} key="sub-menu" />
    : <StagesMenu setExpanded={setExpanded} onStageSelect={props.onStageSelect} key="stages-menu" />;

  return (
    <AnimateSharedLayout>
      <AnimatePresence>
        { expanded && (<BackgroundDimmer clickHandler={resetMenuState}><CloseButton onClick={() => setExpanded(false)} className="close-button-wrapper" /></BackgroundDimmer>)}
      </AnimatePresence>
      <AnimatePresence>
        { (expanded && showSubMenu) && (
          <motion.div
            className="session-info-panel"
            variants={choiceVariants}
            initial="hide"
            animate="show"
            exit="hide"
          >
            <SessionInformation />
          </motion.div>
        )}
      </AnimatePresence>
      <div className="session-panel-drop-obstacle" ref={ref} />
      <motion.div
        className="session-panel"
        key="session-panel"
        layout
      >
        <AnimatePresence exitBeforeEnter>
          { expanded ? menuContent : (
            <SessionNavigation
              onClickNext={props.onClickNext}
              onClickBack={props.onClickBack}
              percentProgress={props.percentProgress}
              setExpanded={setExpanded}
              setShowSubMenu={setShowSubMenu}
              key="session-navigation"
            />
          ) }
        </AnimatePresence>
      </motion.div>
    </AnimateSharedLayout>
  );
});

SessionPanel.propTypes = {
  onStageSelect: PropTypes.func.isRequired,
  onClickNext: PropTypes.func.isRequired,
  onClickBack: PropTypes.func.isRequired,
  percentProgress: PropTypes.number.isRequired,
};

export { SessionPanel };

export default compose(
  DropObstacle,
)(SessionPanel);

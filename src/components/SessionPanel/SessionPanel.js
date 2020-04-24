import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import { motion, AnimatePresence } from 'framer-motion';
import { getCSSVariableAsNumber, getCSSVariableAsString } from '@codaco/ui/lib/utils/CSSVariables';
import { DropObstacle } from '../../behaviours/DragAndDrop';
import StagesMenu from '../StagesMenu/StagesMenu';
import SubMenu from './SubMenu';
import BackgroundDimmer from '../BackgroundDimmer';
import SessionNavigation from './SessionNavigation';
import CloseButton from '../CloseButton';

const SessionPanel = React.forwardRef((props, ref) => {
  const [expanded, setExpanded] = useState(false);
  const [showSubMenu, setShowSubMenu] = useState(false);

  const baseAnimationDuration = getCSSVariableAsNumber('--animation-duration-standard-ms') / 1000;
  const baseAnimationEasing = getCSSVariableAsString('--animation-easing-json');

  const resetMenuState = () => {
    setExpanded(false);
    setShowSubMenu(false);
  };

  const menuContent = showSubMenu ?
    <SubMenu setShowSubMenu={setShowSubMenu} setExpanded={setExpanded} key="sub-menu" />
    : <StagesMenu setExpanded={setExpanded} key="stages-menu" />;

  return (
    <React.Fragment>
      <AnimatePresence>
        { expanded && (<BackgroundDimmer clickHandler={resetMenuState} ><CloseButton onClick={() => setExpanded(false)} className="close-button-wrapper" /></BackgroundDimmer>)}
      </AnimatePresence>
      <div className="session-panel-drop-obstacle" ref={ref} />
      <motion.div
        className="session-panel"
        key="session-panel"
        layoutTransition={{
          duration: baseAnimationDuration,
          easing: baseAnimationEasing,
        }}
      >
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
      </motion.div>
    </React.Fragment>
  );
});

SessionPanel.propTypes = {
  onClickNext: PropTypes.func.isRequired,
  onClickBack: PropTypes.func.isRequired,
  percentProgress: PropTypes.number.isRequired,
};

export { SessionPanel };

export default compose(
  DropObstacle,
)(SessionPanel);

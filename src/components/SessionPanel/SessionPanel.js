import React, { useState } from 'react';
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
    (<SubMenu setShowSubMenu={setShowSubMenu} setExpanded={setExpanded} key="sub-menu" />) : <StagesMenu setExpanded={setExpanded} key="stages-menu" />;

  return (
    <React.Fragment>
      <AnimatePresence>
        { expanded && (<BackgroundDimmer clickHandler={resetMenuState} ><CloseButton onClick={() => setExpanded(false)} className="close-button-wrapper" /></BackgroundDimmer>)}
      </AnimatePresence>
      <div className="timeline-drop-obstacle" ref={ref} />
      <motion.div
        className="timeline"
        key="timeline"
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
            key="SessionNavigation"
          />
        ) }
      </motion.div>
    </React.Fragment>
  );
});

export { SessionPanel };

export default compose(
  DropObstacle,
)(SessionPanel);

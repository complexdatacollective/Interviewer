import React, { useState } from 'react';
import { compose } from 'recompose';
import { motion, AnimatePresence } from 'framer-motion';
import { getCSSVariableAsNumber } from '@codaco/ui/lib/utils/CSSVariables';
import { DropObstacle } from '../../behaviours/DragAndDrop';
import { SettingsMenu } from '../../containers/SettingsMenu';
import { StagesMenu, SubMenu } from '../../containers/Timeline';
import BackgroundDimmer from './BackgroundDimmer';
import TimelineButtons from './TimelineButtons';

export const baseAnimationDuration = getCSSVariableAsNumber('--animation-duration-standard-ms') / 1000;

const Timeline = React.forwardRef((props, ref) => {
  const [expanded, setExpanded] = useState(false);
  const [showSubMenu, setShowSubMenu] = useState(false);

  const resetMenuState = () => {
    setExpanded(false);
    setShowSubMenu(false);
  };

  const menuContent = showSubMenu ?
    (<SubMenu setShowSubMenu={setShowSubMenu} key="sub-menu" />) : <StagesMenu setExpanded={setExpanded} key="stages-menu" />;

  return (
    <React.Fragment>
      <SettingsMenu />
      <AnimatePresence>
        { expanded && (<BackgroundDimmer resetMenuState={resetMenuState} />)}
      </AnimatePresence>
      <div className="timeline-drop-obstacle" ref={ref} />
      <motion.div
        className="timeline"
        key="timeline"
        layoutTransition={{
          duration: baseAnimationDuration,
        }}
      >
        { expanded ? menuContent : (
          <TimelineButtons
            onClickNext={props.onClickNext}
            onClickBack={props.onClickBack}
            percentProgress={props.percentProgress}
            setExpanded={setExpanded}
            setShowSubMenu={setShowSubMenu}
            key="timelinebuttons"
          />
        ) }
      </motion.div>
    </React.Fragment>
  );
});

export { Timeline };

export default compose(
  DropObstacle,
)(Timeline);

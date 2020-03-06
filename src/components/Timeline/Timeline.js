import React, { useState } from 'react';
import { compose } from 'recompose';
import { motion, AnimatePresence } from 'framer-motion';
import { getCSSVariableAsNumber } from '@codaco/ui/lib/utils/CSSVariables';
import { DropObstacle } from '../../behaviours/DragAndDrop';
import { SettingsMenu } from '../../containers/SettingsMenu';
import { StagesMenu, SubMenu } from '../../containers/Timeline';
import BackgroundDimmer from './BackgroundDimmer';
import TimelineButtons from './TimelineButtons';

const Timeline = React.forwardRef((props, ref) => {
  const containerVariants = {
    normal: {
      // background: 'var(--panel-bg-muted)',
    },
    expanded: {
      // background: 'var(--light-background)',
    },
  };

  const standardDuration = getCSSVariableAsNumber('--animation-duration-standard-ms') / 1000;

  const [expanded, setExpanded] = useState(false);
  const [showSubMenu, setShowSubMenu] = useState(false);

  const resetMenuState = () => {
    setExpanded(false);
    setShowSubMenu(false);
  };

  const menuContent = showSubMenu ?
    (<SubMenu setShowSubMenu={setShowSubMenu} />) : <StagesMenu setExpanded={setExpanded} />;

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
        variants={containerVariants}
        initial="normal"
        animate={expanded ? 'expanded' : 'normal'}
        layoutTransition
        transition={{
          duration: standardDuration,
        }}
      >
        <AnimatePresence initial={false} exitBeforeEnter>
          { expanded ? menuContent : (
            <TimelineButtons
              onClickNext={props.onClickNext}
              onClickBack={props.onClickBack}
              percentProgress={props.percentProgress}
              setExpanded={setExpanded}
              setShowSubMenu={setShowSubMenu}
            />
          ) }
        </AnimatePresence>
      </motion.div>
    </React.Fragment>
  );
});

export { Timeline };

export default compose(
  DropObstacle,
)(Timeline);

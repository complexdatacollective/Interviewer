import React, { useState } from 'react';
import { compose } from 'recompose';
import { motion, AnimatePresence } from 'framer-motion';
import { getCSSVariableAsNumber } from '@codaco/ui/lib/utils/CSSVariables';
import { DropObstacle } from '../../behaviours/DragAndDrop';
import { StagesMenu } from '../../containers/Timeline';
import BackgroundDimmer from './BackgroundDimmer';
import TimelineButtons from './TimelineButtons';

const Timeline = () => {
  const containerVariants = {
    normal: {
      // background: 'var(--panel-bg-muted)',
    },
    expanded: {
      // background: 'var(--light-background)',
    },
  };

  const standardDuration = getCSSVariableAsNumber('--animation-duration-standard-ms') / 1000;

  const [expanded, toggleExpanded] = useState(false);

  return (
    <React.Fragment>
      <AnimatePresence>
        { expanded && (<BackgroundDimmer toggleExpanded={toggleExpanded} />)}
      </AnimatePresence>
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
          { !expanded && (<TimelineButtons toggleExpanded={toggleExpanded} />)}
          { expanded && (<StagesMenu />) }
        </AnimatePresence>
      </motion.div>
    </React.Fragment>
  );
};

export { Timeline };

export default compose(
  DropObstacle,
)(Timeline);

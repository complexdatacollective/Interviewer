import React, { useState } from 'react';
import { Button } from '@codaco/ui';
import { Text } from '@codaco/ui/lib/components/Fields';
import { connect } from 'react-redux';
import { motion, useInvertedScale, AnimatePresence } from 'framer-motion';
import { compose } from 'recompose';
import { getCSSVariableAsNumber } from '@codaco/ui/lib/utils/CSSVariables';
import { getProtocolStages } from '../../selectors/protocol';
import { Scroller } from '../../components';
import TimelineStage from './TimelineStage';


const standardDuration = getCSSVariableAsNumber('--animation-duration-standard-ms') / 1000;

const variants = {
  normal: {
    opacity: 0,
    transition: {
      duration: standardDuration,
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
  expanded: {
    opacity: 1,
    transition: {
      // when: 'beforeChildren',
      staggerChildren: 0.075,
      delayChildren: 0.2,
      // delay: 0.2,
      duration: standardDuration,
    },
  },
};

const timelineVariants = {
  expanded: {
    x: 0,
    opacity: 1,
    transition: {
      stiffness: 500, velocity: -100,
    },
  },
  normal: {
    x: '-5rem',
    opacity: 0,
    transition: {
      stiffness: 500, velocity: -100,
    },
  },
};

const StagesMenu = (props) => {
  const [filter, setFilter] = useState('');
  const { scaleX, scaleY } = useInvertedScale();

  const onFilterChange = event => setFilter(event.target.value || '');

  const filteredStageList = props.stages.filter(
    stage => stage.label.toLowerCase().includes(filter.toLowerCase()));

  const renderMenuItems = filteredStageList.map((item, index) =>
    (
      <motion.div
        variants={timelineVariants}
        exit="normal"
        key={item.id}
        positionTransition
      >
        <TimelineStage item={item} index={index} />
      </motion.div>
    ),
  );

  return (
    <motion.div
      className="stages-menu"
      key="stages-menu"
      variants={variants}
      initial="normal"
      exit="normal"
      animate="expanded"
      style={{ scaleX, scaleY }}
    >
      <article className="stages-menu__wrapper">
        <header>
          <Text
            type="search"
            placeholder="Filter by stage name..."
            input={{
              onChange: onFilterChange,
            }}
          />
        </header>
        <div className="menu-timeline">
          {renderMenuItems.length > 0 ? (
            <Scroller>
              <AnimatePresence>
                { renderMenuItems }
              </AnimatePresence>
            </Scroller>
          ) : (
            <h4>No stages match your filter.</h4>
          )}
        </div>
        <footer>
          <Button color="neon-coral">Exit Interview</Button>
        </footer>
      </article>
    </motion.div>
  );
};

function mapStateToProps(state) {
  const currentStages = getProtocolStages(state);

  const withIndex = currentStages.map((stage, index) => ({ ...stage, index }));

  return {
    stages: withIndex,
  };
}

export default compose(
  connect(mapStateToProps, null),
)(StagesMenu);

import React, { useState } from 'react';
import { Button } from '@codaco/ui';
import { Text } from '@codaco/ui/lib/components/Fields';
import { connect } from 'react-redux';
import { motion, useInvertedScale } from 'framer-motion';
import { compose } from 'recompose';
import { getCSSVariableAsNumber } from '@codaco/ui/lib/utils/CSSVariables';
import CloseButton from '../CloseButton';
import { getProtocolStages } from '../../../selectors/protocol';
import { Scroller } from '../../../components';
import TimelineStage from './TimelineStage';


const variants = {
  normal: {
    opacity: 0,
    transition: {
      duration: 1,
    },
  },
  expanded: {
    opacity: 1,
    transition: {
      // when: 'beforeChildren',
      staggerChildren: 0.075,
      delayChildren: 0.2,
      // delay: 0.4,
      duration: 1,
    },
  },
};

const timelineVariants = {
  expanded: {
    x: 0,
    opacity: 1,
    transition: {
      x: { stiffness: 500, velocity: -100 },
    },
  },
  normal: {
    x: '-5rem',
    opacity: 0,
    transition: {
      x: { stiffness: 500 },
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
      >
        <TimelineStage item={item} key={item.id} index={index} />
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
        <div className="main-menu-timeline">
          {renderMenuItems.length > 0 ? (
            <Scroller>
              { renderMenuItems }
            </Scroller>
          ) : (
            <p>No stages to display.</p>
          )}
        </div>
        <footer>
          <div>
            <h4>Filter: </h4>
            <Text
              type="search"
              placeholder="Filter Stages..."
              input={{
                onChange: onFilterChange,
              }}
            />
          </div>
          <Button>Finish Interview</Button>
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

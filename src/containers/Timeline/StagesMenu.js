import React, { useState, useRef, useEffect } from 'react';
import { Text } from '@codaco/ui/lib/components/Fields';
import { connect } from 'react-redux';
import { motion, useInvertedScale, AnimatePresence } from 'framer-motion';
import { compose } from 'recompose';
import { getCSSVariableAsNumber } from '@codaco/ui/lib/utils/CSSVariables';
import { actionCreators as sessionActions } from '../../ducks/modules/session';
import { getProtocolStages } from '../../selectors/protocol';
import { Scroller } from '../../components';
import TimelineStage from './TimelineStage';
import { currentStageIndex } from '../../utils/matchSessionPath';


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
      duration: standardDuration,
    },
  },
  normal: {
    x: '-5rem',
    opacity: 0,
    transition: {
      duration: standardDuration,
    },
  },
};

const StagesMenu = (props) => {
  const [filter, setFilter] = useState('');
  const { scaleX, scaleY } = useInvertedScale();
  const scrollerRef = useRef(null);

  const scrollToLocation = (amount) => {
    if (scrollerRef && scrollerRef.current) {
      scrollerRef.current.scrollTo(0, amount);
    }
  };

  const positionTransition = {
    type: 'spring',
    damping: 200,
    stiffness: 1200,
    velocity: 200,
  };

  const onFilterChange = event => setFilter(event.target.value || '');

  const filteredStageList = props.stages.filter(
    stage => stage.label.toLowerCase().includes(filter.toLowerCase()));

  const renderMenuItems = filteredStageList.map((item, index) => {
    const isActive = props.currentStageIndex === item.index;

    return (
      <motion.div
        variants={timelineVariants}
        exit="normal"
        key={item.id}
        positionTransition={positionTransition}
      >
        <TimelineStage
          item={item}
          index={index}
          active={isActive}
          setExpanded={props.setExpanded}
        />
      </motion.div>
    );
  });


  useEffect(() => {
    // Scroll to the active stage
    // This can't use a reference to a dom element because of the staggered
    // animation (ref won't exist until the element has rendered). Instead,
    // scroll the container to where the element will be when it finishes
    // animating.
    //
    // setTimeout is there so the container & elements have height set.
    // Please implement a better way if you know of one!
    if (!filter) {
      setTimeout(() => {
        // TODO: find a better way to calculate this!
        const itemHeight = document.getElementsByClassName('menu-timeline-stage')[0].clientHeight;
        scrollToLocation(props.currentStageIndex * itemHeight, 0.2);
      });
    }
  });

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
          <h1>Interview Stages</h1>
        </header>
        <div className="menu-timeline">
          {renderMenuItems.length > 0 ? (
            <Scroller forwardedRef={scrollerRef}>
              <AnimatePresence>
                { renderMenuItems }
              </AnimatePresence>
            </Scroller>
          ) : (
            <h4>No stages match your filter.</h4>
          )}
        </div>
        <footer>
          <Text
            type="search"
            placeholder="Type to filter stages..."
            input={{
              onChange: onFilterChange,
            }}
          />
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
    currentStageIndex: currentStageIndex(state.router.location.pathname),
  };
}

const mapDispatchToProps = {
  endSession: sessionActions.endSession,
};

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
)(StagesMenu);

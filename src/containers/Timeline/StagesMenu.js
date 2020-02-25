import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@codaco/ui';
import { Text } from '@codaco/ui/lib/components/Fields';
import { connect } from 'react-redux';
import { motion, useInvertedScale, AnimatePresence } from 'framer-motion';
import { compose } from 'recompose';
import { getCSSVariableAsNumber } from '@codaco/ui/lib/utils/CSSVariables';
import { getProtocolStages } from '../../selectors/protocol';
import { Scroller } from '../../components';
import TimelineStage from './TimelineStage';
import { currentStageIndex } from '../../utils/matchSessionPath';

const getScrollParent = (node) => {
  const regex = /(auto|scroll)/;
  const parents = (_node, ps) => {
    if (_node.parentNode === null) { return ps; }
    return parents(_node.parentNode, ps.concat([_node]));
  };

  const style = (_node, prop) => getComputedStyle(_node, null).getPropertyValue(prop);
  const overflow = _node => style(_node, 'overflow') + style(_node, 'overflow-y') + style(_node, 'overflow-x');
  const scroll = _node => regex.test(overflow(_node));

  /* eslint-disable consistent-return */
  const scrollParent = (_node) => {
    if (!(_node instanceof HTMLElement || _node instanceof SVGElement)) {
      return;
    }

    const ps = parents(_node.parentNode, []);

    for (let i = 0; i < ps.length; i += 1) {
      if (scroll(ps[i])) {
        return ps[i];
      }
    }

    return document.scrollingElement || document.documentElement;
  };

  return scrollParent(node);
  /* eslint-enable consistent-return */
};

const standardDuration = getCSSVariableAsNumber('--animation-duration-standard-ms') / 1000;

const scrollToActive = (activeID) => {
  const element = document.querySelectorAll(`[data-stage-id='${activeID}']`)[0];
  console.log(activeID, element);
  if (element) {
    const scroller = getScrollParent(element);
    const scrollValue = element.offsetTop - scroller.offsetTop - 50;
    scroller.scrollTo(0, scrollValue);
  }
};

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

  const renderMenuItems = filteredStageList.map((item, index) => {
    const isActive = props.currentStageIndex === index;

    return (
      <motion.div
        variants={timelineVariants}
        exit="normal"
        key={item.id}
        positionTransition
      >
        <TimelineStage item={item} index={index} active={isActive} />
      </motion.div>
    );
  });


  useEffect(() => {
    setTimeout(() => {
      scrollToActive(props.currentStageIndex);
    }, getCSSVariableAsNumber('--animation-duration-standard-ms') + 500);
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
          <h4>Filter: </h4>
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
    currentStageIndex: currentStageIndex(state.router.location.pathname),
  };
}

export default compose(
  connect(mapStateToProps, null),
)(StagesMenu);

import React, { useState, useRef, useLayoutEffect } from 'react';
import PropTypes from 'prop-types';
import { Text } from '@codaco/ui/lib/components/Fields';
import { connect } from 'react-redux';
import { motion, useInvertedScale, AnimatePresence } from 'framer-motion';
import { compose } from 'recompose';
import { getCSSVariableAsNumber, getCSSVariableAsString } from '@codaco/ui/lib/utils/CSSVariables';
import { getProtocolStages } from '../../selectors/protocol';
import { Scroller } from '..';
import StagePreview from './StagePreview';
import { currentStageIndex } from '../../utils/matchSessionPath';

const StagesMenu = (props) => {
  const [filter, setFilter] = useState('');
  const [imageLoaded, updateImageLoaded] = useState(false);
  const { scaleX, scaleY } = useInvertedScale();
  const scrollerRef = useRef(null);

  const baseAnimationDuration = getCSSVariableAsNumber('--animation-duration-standard-ms') / 1000;
  const baseAnimationEasing = getCSSVariableAsString('--animation-easing-json');

  const variants = {
    normal: {
      opacity: 0,
      transition: {
        duration: baseAnimationDuration,
        easing: baseAnimationEasing,
        staggerChildren: 0.05,
        staggerDirection: -1,
      },
    },
    expanded: {
      opacity: 1,
      transition: {
        when: 'beforeChildren',
        staggerChildren: 0.075,
        duration: baseAnimationDuration,
        easing: baseAnimationEasing,
      },
    },
  };

  const timelineVariants = {
    expanded: {
      x: 0,
      opacity: 1,
      transition: {
        when: 'beforeChildren',
        duration: baseAnimationDuration,
        easing: baseAnimationEasing,
      },
    },
    normal: {
      x: '-5rem',
      opacity: 0,
      transition: {
        duration: baseAnimationDuration,
        easing: baseAnimationEasing,
      },
    },
  };

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
        className="stages-menu__preview-wrapper"
      >
        <StagePreview
          item={item}
          index={index}
          active={isActive}
          setExpanded={props.setExpanded}
          onImageLoaded={() => updateImageLoaded(true)}
        />
      </motion.div>
    );
  });

  useLayoutEffect(() => {
    // This effect is designed to scroll to the active stage
    //
    // This can't use a reference to a dom element because of the staggered
    // animation (ref won't exist until the element has rendered). Instead,
    // scroll the container to where the element will be when it finishes
    // animating, based on the calculated height of each element * number
    // of elements.
    //
    // NOTE: because element height changes after the image is loaded, and
    // because the image does not load immediately, we need to tie this
    // effect to the imageLoaded state, which is itself updated as images
    // load.
    //
    // This is not at all graceful. Please implement a better way if you
    // know of one!

    if (!filter) {
      const itemHeight = document.getElementsByClassName('stages-menu__preview-wrapper')[0].clientHeight;
      scrollToLocation(props.currentStageIndex * itemHeight, 0.2);
    }
  }, [imageLoaded]);

  return (
    <motion.div
      className="stages-menu"
      key="stages-menu"
      variants={variants}
      initial="normal"
      animate="expanded"
      style={{ scaleX, scaleY }}
    >
      <article className="stages-menu__wrapper">
        {renderMenuItems.length > 0 ? (
          <Scroller useSmoothScrolling={false} forwardedRef={scrollerRef}>
            <AnimatePresence>
              { renderMenuItems }
            </AnimatePresence>
          </Scroller>
        ) : (
          <h4>No stages match your filter.</h4>
        )}
      </article>
      <motion.footer
        animate={{ y: 0 }}
        initial={{ y: '100%' }}
        transition={{ duration: baseAnimationDuration, delay: baseAnimationDuration }}
        className="stages-menu__footer"
      >
        <Text
          type="search"
          placeholder="Filter..."
          input={{
            onChange: onFilterChange,
          }}
        />
      </motion.footer>
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


StagesMenu.propTypes = {
  stages: PropTypes.array.isRequired,
  currentStageIndex: PropTypes.number.isRequired,
};

export default compose(
  connect(mapStateToProps, null),
)(StagesMenu);

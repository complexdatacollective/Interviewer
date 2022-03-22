import React, { useState, useRef, useLayoutEffect } from 'react';
import PropTypes from 'prop-types';
import { Search } from '@codaco/ui/lib/components/Fields';
import { connect } from 'react-redux';
import { motion, AnimatePresence, AnimateSharedLayout } from 'framer-motion';
import { compose } from 'recompose';
import { Scroller } from '@codaco/ui';
import { getCSSVariableAsNumber, getCSSVariableAsString } from '@codaco/ui/lib/utils/CSSVariables';
import { getProtocolStages } from '../../selectors/protocol';
import StagePreview from './StagePreview';
import { currentStageIndex as getCurrentStageIndex } from '../../utils/matchSessionPath';

const StagesMenu = (props) => {
  const {
    currentStageIndex,
    stages,
    setExpanded,
    onStageSelect,
  } = props;

  const [filter, setFilter] = useState('');

  const scrollerRef = useRef(null);

  const baseAnimationDuration = getCSSVariableAsNumber('--animation-duration-standard-ms') / 1000;
  const baseAnimationEasing = getCSSVariableAsString('--animation-easing-json');

  const containerVariants = {
    normal: {
      opacity: 0,
      transition: {
        duration: baseAnimationDuration,
        easing: baseAnimationEasing,
      },
    },
    expanded: {
      opacity: 1,
      transition: {
        when: 'beforeChildren',
        duration: baseAnimationDuration,
        easing: baseAnimationEasing,
      },
    },
  };

  const calculateDelay = (currentItemIndex) => {
    /**
     * Purpose of this function is to ensure we animate only the items
     * that are currently visible.
     * */

    const delayScale = 0.1;

    // Active index 0, current index less than 8: animate first 8 items.
    if (
      currentStageIndex === 0
      && currentItemIndex < 8
    ) {
      return currentItemIndex * delayScale;
    }

    // Active index non-zero: resequence index to 8 following current.
    if (
      currentStageIndex > 0
      && currentItemIndex < (currentStageIndex + 8)
      && (stages.length - currentStageIndex) > 8
    ) {
      const resequencedIndex = currentItemIndex - currentStageIndex;
      return resequencedIndex * delayScale;
    }

    // Active index within 8 of end: resequence to last 8
    if (
      (stages.length - currentStageIndex) < 8
      && stages.length - currentItemIndex < 8
    ) {
      const resequencedIndex = (stages.length - currentItemIndex - 8) * -1;
      return resequencedIndex * delayScale;
    }

    // Don't animate
    return 0;
  };

  const itemVariants = {
    expanded: (currentItemIndex) => ({
      x: 0,
      opacity: 1,
      transition: {
        delay: calculateDelay(currentItemIndex) + 0.5,
        duration: baseAnimationDuration,
        easing: baseAnimationEasing,
      },
    }),
    normal: (currentItemIndex) => ({
      x: '-5rem',
      opacity: 0,
      transition: {
        delay: calculateDelay(currentItemIndex),
        duration: baseAnimationDuration,
        easing: baseAnimationEasing,
      },
    }),
    filtered: () => ({
      opacity: 0,
      transition: {
        duration: baseAnimationDuration,
        easing: baseAnimationEasing,
      },
    }),
  };

  const scrollToLocation = (amount) => {
    if (scrollerRef && scrollerRef.current) {
      scrollerRef.current.scrollTo(0, amount);
    }
  };

  const onFilterChange = (event) => setFilter(event.target.value || '');

  const filteredStageList = stages.filter(
    (stage) => stage.label.toLowerCase().includes(filter.toLowerCase()),
  );

  const renderMenuItems = filteredStageList.map((item, index) => {
    const isActive = currentStageIndex === item.index;

    return (
      <motion.div
        custom={index}
        variants={itemVariants}
        initial="normal"
        animate="expanded"
        exit="filtered"
        key={item.id}
        layout
        className="stages-menu__preview-wrapper"
      >
        <StagePreview
          onStageSelect={onStageSelect}
          item={item}
          index={index}
          active={isActive}
          setExpanded={setExpanded}
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
      scrollToLocation(currentStageIndex * itemHeight, 0.2);
    }
  }, []);

  return (
    <motion.div
      className="stages-menu"
      key="stages-menu"
      variants={containerVariants}
      initial="normal"
      animate="expanded"
      layout
    >
      <motion.article
        className="stages-menu__wrapper"
      >
        {renderMenuItems.length > 0 ? (
          <Scroller useSmoothScrolling={false} ref={scrollerRef}>
            <AnimateSharedLayout>
              <AnimatePresence>
                { renderMenuItems }
              </AnimatePresence>
            </AnimateSharedLayout>
          </Scroller>
        ) : (
          <h4>No stages match your filter.</h4>
        )}
      </motion.article>
      <motion.footer
        animate={{ y: 0 }}
        initial={{ y: '100%' }}
        transition={{ duration: baseAnimationDuration, delay: baseAnimationDuration }}
        className="stages-menu__footer"
      >
        <Search
          placeholder="Filter..."
          input={{
            onChange: onFilterChange,
            id: 'stages-filter-input',
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
    currentStageIndex: getCurrentStageIndex(state.router.location.pathname),
  };
}

StagesMenu.propTypes = {
  stages: PropTypes.array.isRequired,
  currentStageIndex: PropTypes.number.isRequired,
  setExpanded: PropTypes.func.isRequired,
};

export default compose(
  connect(mapStateToProps, null),
)(StagesMenu);

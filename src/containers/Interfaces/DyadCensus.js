import React, { useCallback, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import PropTypes from 'prop-types';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@codaco/ui';
import RadioGroup from '@codaco/ui/lib/components/Fields/RadioGroup';
import withPrompt from '../../behaviours/withPrompt';
import { actionCreators as sessionsActions } from '../../ducks/modules/sessions';
import { entityPrimaryKeyProperty } from '../../ducks/modules/network';
import { makeNetworkNodesForPrompt as makeGetNodesForPrompt } from '../../selectors/interface';
import { getNetworkEdges } from '../../selectors/network';
import PromptSwiper from '../PromptSwiper';

const variants = {
  initial: { translateX: '100%', opacity: 0, position: 'absolute', top: 0, left: 0 },
  enter: { translateX: '0%', opacity: 1 },
  exit: { translateX: '-100%', opacity: 0 },
};

const options = [
  { value: false, label: 'no' },
  { value: true, label: 'yes' },
];

/**
  * Dyad Census Interface
  */
const DyadCensus = ({
  onComplete,
  registerBeforeNext,
  prompt,
  promptBackward,
  promptForward,
  stage: { prompts },
  pairs,
  nodes,
  edges,
}) => {
  const [state, setState] = useState({
    progress: null,
    current: 0,
    selected: null,
  });

  const next = () => {
    // save edge state
    setState(s => ({
      ...s,
      current: s.current + 1,
      selected: null,
      progress: s.progress > s.current + 1 ? s.progress : s.current + 1,
    }));
  };

  const back = () => {
    setState(s => ({
      ...s,
      current: s.current - 1,
      selected: null,
    }));
  };

  const select = (value) => {
    setState(s => ({
      ...s,
      selected: value,
    }));
  };

  // TODO: Should this also receive an onComplete method?
  const beforeNext = useCallback((direction) => {
    if (direction < 0 && state.current > 0) {
      back();
      return;
    }

    console.log('yes or no only!');
    next();
    // could save and continue...s
  }, [back, next]);

  useEffect(() => {
    registerBeforeNext(beforeNext);
  }, [beforeNext]);

  const handleChange = useCallback((newValue) => {
    select(newValue);
  }, [select]);

  const handleConfirm = useCallback(() => {
    next();
  }, [next]);

  const currentPair = pairs[state.current];

  const getCurrentValue = () => {
    if (state.selected) { return state.selected; }

    const edge = edges.find(({ from, to }) => (
      from === currentPair[0] && to === currentPair[1] ||
      to === currentPair[0] && from === currentPair[1]
    ));

    if (edge) {
      return true;
    }

    if (!edge && state.progress > state.current) {
      return false;
    }

    return null;
  };

  return (
    <div className="interface">
      <div className="interface__prompt">
        <PromptSwiper
          forward={promptForward}
          backward={promptBackward}
          prompt={prompt}
          prompts={prompts}
        />
      </div>
      <div className="interface__main">
        <h3>PAIR</h3>
        <p>{state.current + 1}/{pairs.length}</p>
        <div
          style={{
            position: 'relative',
          }}
        >
          <AnimatePresence>
            <motion.div
              key={state.current}
              variants={variants}
              initial="initial"
              animate="enter"
              exit="exit"
            >
              <RadioGroup
                input={{
                  onChange: handleChange,
                  value: getCurrentValue(),
                }}
                options={options}
              />

              <Button
                onClick={handleConfirm}
              >Confirm</Button>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

DyadCensus.defaultProps = {
  form: null,
};

DyadCensus.propTypes = {
  prompt: PropTypes.object.isRequired,
  promptBackward: PropTypes.func.isRequired,
  promptForward: PropTypes.func.isRequired,
  stage: PropTypes.object.isRequired,
};

const makeMapStateToProps = () => {
  const getNodesForPrompt = makeGetNodesForPrompt();

  const mapStateToProps = (state, props) => {
    const nodes = getNodesForPrompt(state, props);
    const edges = getNetworkEdges(state, props);
    const nodeIds = nodes.map(node => node[entityPrimaryKeyProperty]);

    // const pairs = nodeIds.flatMap(
    //   id =>
    //     nodeIds
    //       .filter(alterId => alterId !== id)
    //       .map(alterId => ([id, alterId])),
    // );
    // mutally exclusive only
    const pairs = nodeIds.reduce(
      ({ result, pool }, id) => {
        const nextPool = pool.filter(alterId => alterId !== id);

        if (nextPool.length === 0) {
          return result;
        }

        const newPairs = nextPool.map(alterId => ([id, alterId]));

        return {
          result: [...result, ...newPairs],
          pool: nextPool,
        };
      },
      { pool: nodeIds, result: [] },
    );

    return {
      pairs,
      nodes,
      edges,
    };
  };

  return mapStateToProps;
};

const mapDispatchToProps = {
  updateNode: sessionsActions.updateNode,
};

export default compose(
  withPrompt,
  connect(makeMapStateToProps, mapDispatchToProps),
)(DyadCensus);

export {
  DyadCensus as UnconnectedDyadCensus,
};

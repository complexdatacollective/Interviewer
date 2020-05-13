import React, { useCallback, useEffect } from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import PropTypes from 'prop-types';
import { AnimatePresence, motion } from 'framer-motion';
import cx from 'classnames';
import { Button } from '@codaco/ui';
import RadioGroup from '@codaco/ui/lib/components/Fields/RadioGroup';
import withPrompt from '../../../behaviours/withPrompt';
import { actionCreators as sessionsActions } from '../../../ducks/modules/sessions';
import { entityPrimaryKeyProperty } from '../../../ducks/modules/network';
import { makeNetworkNodesForType as makeGetNodes } from '../../../selectors/interface';
import { getNetworkEdges as getEdges } from '../../../selectors/network';
import ProgressBar from '../../../components/ProgressBar';
import PromptSwiper from '../../PromptSwiper';
import useSteps, { compareSteps } from './useSteps';
import useEdgeState from './useEdgeState';

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
  promptId: promptIndex,
  prompt,
  promptBackward,
  promptForward,
  stage,
  pairs,
  nodes,
  edges,
  dispatch,
}) => {
  const steps = Array(stage.prompts.length).fill(pairs.length);

  const [state, nextStep, previousStep] = useSteps(
    steps,
    promptIndex || 0,
    { onComplete, dispatch },
  );

  const getCurrentPair = () => pairs[state.step];

  const getEdgeInNetwork = () => {
    const [a, b] = getCurrentPair();

    const edge = edges.find(({ from, to, type }) => (
      type === prompt.edge &&
      ((from === a && to === b) || (to === b && from === a))
    ));

    return edge;
  };

  const getHasEdgeInNetwork = () =>
    !!getEdgeInNetwork();

  const [edgeState, setEdgeState, updateNetwork] = useEdgeState(
    prompt.edge, // TODO: createEdge?
    { dispatch },
    [promptIndex, state.step],
  );

  const getHasEdge = () => {
    // Have we set a manual value? If so return that
    if (edgeState !== null) { return edgeState; }

    const hasEdgeInNetwork = getHasEdgeInNetwork();

    // If we haven't set a value, and an edge exists, consider this a 'yes';
    if (hasEdgeInNetwork) { return true; }

    // If we've visited this step previously (progress), and no edge exists consider
    // this an implicit 'no'
    if (state.progress > state.step) {
      return false;
    }

    // Otherwise consider this blank
    return null;
  };

  const next = () => {
    // validate
    updateNetwork(getCurrentPair(), getEdgeInNetwork());
    nextStep();
  };

  // TODO: Should this also receive an onComplete method?
  const beforeNext = useCallback((direction) => {
    if (direction < 0) {
      previousStep();
      return;
    }

    next();
  }, [previousStep, next]);

  useEffect(() => {
    registerBeforeNext(beforeNext);
  }, [beforeNext]);

  const handleChange = setEdgeState;

  const handleConfirm = next;

  const progressClasses = cx(
    'progress-container',
    {
      'progress-container--show': state.progress > 0,
    },
  );

  return (
    <div className="interface">
      <div className="interface__prompt">
        <PromptSwiper
          forward={promptForward}
          backward={promptBackward}
          prompt={prompt}
          prompts={stage.prompts}
        />
      </div>
      <div className="interface__main">
        <p>{state.step + 1}/{pairs.length}</p>
        <div
          style={{
            position: 'relative',
          }}
        >
          <AnimatePresence>
            <motion.div
              key={`${promptIndex}_${state.step}`}
              variants={variants}
              initial="initial"
              animate="enter"
              exit="exit"
            >
              <RadioGroup
                input={{
                  onChange: handleChange,
                  value: getHasEdge(),
                }}
                options={options}
              />

              <Button
                onClick={handleConfirm}
              >Confirm</Button>
            </motion.div>
          </AnimatePresence>
        </div>
        <div className={progressClasses}>
          <h6 className="progress-container__status-text">
            <strong>{state.step}</strong> of <strong>{pairs.length}</strong>
          </h6>
          <ProgressBar orientation="horizontal" percentProgress={(state.step / pairs.length) * 100} />
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
  const getNodes = makeGetNodes();

  const mapStateToProps = (state, props) => {
    const nodes = getNodes(state, props);
    const edges = getEdges(state, props);
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

export default compose(
  withPrompt,
  connect(makeMapStateToProps),
)(DyadCensus);

export {
  DyadCensus as UnconnectedDyadCensus,
};

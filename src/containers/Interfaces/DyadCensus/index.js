import React, { useCallback, useEffect } from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import PropTypes from 'prop-types';
import { get } from 'lodash';
import { AnimatePresence, motion } from 'framer-motion';
import { getCSSVariableAsNumber } from '@codaco/ui/lib/utils/CSSVariables';
import withPrompt from '../../../behaviours/withPrompt';
import { entityPrimaryKeyProperty } from '../../../ducks/modules/network';
import { makeNetworkNodesForType as makeGetNodes } from '../../../selectors/interface';
import { getNetworkEdges as getEdges } from '../../../selectors/network';
import { getProtocolCodebook } from '../../../selectors/protocol';
import { actionCreators as sessionsActions } from '../../../ducks/modules/sessions';
import ProgressBar from '../../../components/ProgressBar';
import PromptSwiper from '../../PromptSwiper';
import Node from '../../../containers/Node';
import useSteps from './useSteps';
import useNetworkEdgeState from './useEdgeState';
import useAutoAdvance from './useAutoAdvance';
import Button from './Button';

const animationOffset = 200;
const animationTarget = -50;

const getVariants = () => {
  const slowDuration = getCSSVariableAsNumber('--animation-duration-slow-ms') / 1000;
  const duration = getCSSVariableAsNumber('--animation-duration-standard-ms') / 1000;

  const pairTransition = {
    duration: slowDuration,
    when: 'afterChildren',
  };

  const translateUp = `${animationTarget - animationOffset}%`;
  const translateDown = `${animationTarget + animationOffset}%`;
  const translateTarget = `${animationTarget}%`;

  const pairVariants = {
    show: () => ({
      translateY: translateTarget,
      translateX: '-50%',
      opacity: 1,
      transition: pairTransition,
    }),
    initial: ([isForwards]) => ({
      translateY: isForwards ? translateDown : translateUp,
      translateX: '-50%',
      opacity: 0,
    }),
    hide: ([isForwards]) => ({
      translateY: !isForwards ? translateDown : translateUp,
      translateX: '-50%',
      opacity: 0,
      transition: pairTransition,
    }),
  };

  const edgeVariants = {
    show: { opacity: 1, transition: { duration } },
    hide: { opacity: 0, transition: { duration } },
  };

  return { edgeVariants, pairVariants };
};

/**
  * Dyad Census Interface
  */
const DyadCensus = ({
  onComplete,
  registerBeforeNext,
  promptId: promptIndex, // TODO: what is going on here?
  prompt,
  promptBackward,
  promptForward,
  stage,
  pairs,
  nodes,
  edges,
  edgeColor,
  dispatch,
}) => {
  const steps = Array(stage.prompts.length).fill(pairs.length);

  const [state, nextStep, previousStep] = useSteps(
    steps,
  );

  const getNode = id =>
    nodes.find(node => node[entityPrimaryKeyProperty] === id);

  const getPair = () => get(pairs, state.substep, null);
  const pair = getPair();

  const [hasEdge, setEdge, isTouched, isChanged] = useNetworkEdgeState(
    dispatch,
    edges,
    prompt.edge, // TODO: createEdge?
    pair,
    state.step,
    state.progress,
  );

  const next = () => {
    // validate

    // go to next step
    if (state.isEnd) {
      onComplete();
      return;
    }

    if (state.isStageEnd) {
      dispatch(sessionsActions.updatePrompt(promptIndex + 1));
    }

    // TODO: chheck state in here
    nextStep();
  };

  const back = () => {
    // go to next step
    if (state.isStart) {
      onComplete();
      return;
    }

    if (state.isStageStart) {
      dispatch(sessionsActions.updatePrompt(promptIndex - 1));
    }

    // TODO: check state in here
    previousStep();
  };

  // TODO: Should this also receive an onComplete method?
  const beforeNext = useCallback((direction) => {
    if (direction < 0) {
      back();
      return;
    }

    next();
  }, [back, next]);

  useEffect(() => {
    registerBeforeNext(beforeNext);
  }, [beforeNext]);

  useAutoAdvance(next, isTouched, isChanged);

  const handleChange = nextValue =>
    () => {
      // 'debounce' clicks, one click (isTouched) should start auto-advance
      // so ignore further clicks
      if (isTouched) { return; }
      setEdge(nextValue);
    };

  const fromNode = getNode(pair[0]);
  const toNode = getNode(pair[1]);
  const isForwards = state.direction !== 'backward'; // .i.e. default to true
  const { edgeVariants, pairVariants } = getVariants();

  return (
    <div className="interface dyad-interface">
      <div className="interface__prompt">
        <PromptSwiper
          forward={promptForward}
          backward={promptBackward}
          prompt={prompt}
          prompts={stage.prompts}
        />
      </div>
      <div className="interface__main">
        <div className="dyad-interface__layout">
          <div className="dyad-interface__pairs">
            <AnimatePresence
              custom={[isForwards]}
              initial={false}
            >
              <motion.div
                className="dyad-interface__pair"
                key={`${promptIndex}_${state.step}`}
                custom={[isForwards]}
                variants={pairVariants}
                initial="initial"
                animate="show"
                exit="hide"
              >
                <div className="dyad-interface__nodes">
                  <Node {...fromNode} />
                  <motion.div
                    className="dyad-interface__edge"
                    style={{ backgroundColor: `var(--${edgeColor})` }}
                    variants={edgeVariants}
                    initial="hide"
                    animate={hasEdge ? 'show' : 'hide'}
                  />
                  <Node {...toNode} />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="dyad-interface__choice">
            <div className="dyad-interface__options">
              <div className="dyad-interface__yes">
                <Button
                  onClick={handleChange(true)}
                  selected={hasEdge}
                >Yes</Button>
              </div>
              <div className="dyad-interface__no">
                <Button
                  onClick={handleChange(false)}
                  selected={!hasEdge && hasEdge !== null}
                  className="no"
                >No</Button>
              </div>
            </div>
            <div className="dyad-interface__progress">
              <h6 className="progress-container__status-text">
                <strong>{state.substep + 1}</strong> of <strong>{pairs.length}</strong>
              </h6>
              <ProgressBar orientation="horizontal" percentProgress={((state.step + 1) / pairs.length) * 100} />
            </div>
          </div>
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
    const codebook = getProtocolCodebook(state, props);
    const nodeIds = nodes.map(node => node[entityPrimaryKeyProperty]);

    const edgeColor = get(codebook, ['edge', props.prompt.edge, 'color']);

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
      edgeColor,
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

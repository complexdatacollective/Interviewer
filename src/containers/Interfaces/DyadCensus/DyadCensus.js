import React, { useCallback, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import PropTypes from 'prop-types';
import cx from 'classnames';
import BooleanOption from '@codaco/ui/lib/components/Boolean/BooleanOption';
import { AnimatePresence, motion } from 'framer-motion';
import { Markdown } from '@codaco/ui/lib/components/Fields';
import Prompts from '../../../components/Prompts';
import withPrompt from '../../../behaviours/withPrompt';
import { makeNetworkNodesForType as makeGetNodes } from '../../../selectors/interface';
import { getNetworkEdges as getEdges } from '../../../selectors/network';
import { getStageState } from '../../../selectors/session';
import { getProtocolCodebook } from '../../../selectors/protocol';
import { actionCreators as navigateActions } from '../../../ducks/modules/navigate';
import { getPairs, getNodePair } from './helpers';
import useSteps from './useSteps';
import useNetworkEdgeState from './useEdgeState';
import useAutoAdvance from './useAutoAdvance';
import Pair from './Pair';
import { get } from '../../../utils/lodash-replacements';

const fadeVariants = {
  show: { opacity: 1, transition: { duration: 0.5 } },
  hide: { opacity: 0, transition: { duration: 0.5 } },
};

const optionsVariants = {
  show: { opacity: 1, transition: { delay: 0.15, duration: 0.25 } },
  hide: { opacity: 0, transition: { delay: 0.15, duration: 0.25 } },
};

const choiceVariants = {
  show: { opacity: 1, translateY: '0%', transition: { delay: 0.15, type: 'spring' } },
  hide: { opacity: 0, translateY: '120%' },
};

const introVariants = {
  show: { opacity: 1, scale: 1 },
  hide: { opacity: 0, scale: 0 },
};

/**
  * Dyad Census Interface
  */
const DyadCensus = ({
  registerBeforeNext,
  promptId: promptIndex, // TODO: what is going on here?
  prompt,
  stage,
  pairs,
  nodes,
  edges,
  edgeColor,
  dispatch,
  stageState,
  onComplete,
}) => {
  const [isIntroduction, setIsIntroduction] = useState(true);
  const [isForwards, setForwards] = useState(true);
  const [isValid, setIsValid] = useState(true);

  // Number of pairs times number of prompts e.g. `[3, 3, 3]`
  const steps = Array(stage.prompts.length).fill(get(pairs, 'length', 0));
  const [stepsState, nextStep, previousStep] = useSteps(steps);

  const pair = get(pairs, stepsState.substep, null);
  const [fromNode, toNode] = getNodePair(nodes, pair);

  const [hasEdge, setEdge, isTouched, isChanged] = useNetworkEdgeState(
    dispatch,
    edges,
    prompt.createEdge, // Type of edge to create
    pair,
    promptIndex,
    stageState,
    [stepsState.step],
  );

  const next = () => {
    setForwards(true);
    setIsValid(true);

    if (isIntroduction) {
      // If there are no steps, clicking next should advance the stage
      if (stepsState.totalSteps === 0) {
        dispatch(navigateActions.goToNextStage());
        return;
      }

      setIsIntroduction(false);
      return;
    }

    // check value has been set
    if (hasEdge === null) {
      setIsValid(false);
      return;
    }

    if (stepsState.isStageEnd) {
      dispatch(navigateActions.goToNext());
    }

    if (stepsState.isEnd) { return; }

    nextStep();
  };

  const back = () => {
    setForwards(false);
    setIsValid(true);

    if (stepsState.isStart && !isIntroduction) {
      setIsIntroduction(true);
      return;
    }

    if (stepsState.isStageStart) {
      dispatch(navigateActions.goToNext(-1));
    }

    if (stepsState.isStart) { return; }

    previousStep();
  };

  const beforeNext = useCallback((direction, index = -1) => {
    if (index !== -1) {
      onComplete();
      return;
    }

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

  const handleChange = (nextValue) => () => {
    // 'debounce' clicks, one click (isTouched) should start auto-advance
    // so ignore further clicks
    if (isTouched) { return; }
    setEdge(nextValue);
  };

  const choiceClasses = cx(
    'dyad-census__choice',
    { 'dyad-census__choice--invalid': !isValid },
  );

  return (
    <div className="dyad-census">
      <AnimatePresence
        initial={false}
        exitBeforeEnter
      >
        {isIntroduction
          && (
            <motion.div
              className="dyad-census__introduction"
              variants={introVariants}
              initial="hide"
              exit="hide"
              animate="show"
              key="intro"
            >
              <h1>{stage.introductionPanel.title}</h1>
              <Markdown
                label={stage.introductionPanel.text}
              />
            </motion.div>
          )}
        {!isIntroduction
          && (
            <motion.div
              key="content"
              variants={fadeVariants}
              initial="hide"
              exit="hide"
              animate="show"
              className="dyad-census__wrapper"
            >
              <div className="dyad-census__prompt">
                <Prompts
                  currentPrompt={stage.prompts[promptIndex].id}
                  prompts={stage.prompts}
                />
              </div>
              <AnimatePresence exitBeforeEnter>
                <motion.div
                  className="dyad-census__main"
                  key={promptIndex}
                  variants={fadeVariants}
                  initial="hide"
                  exit="hide"
                  animate="show"
                >
                  <div className="dyad-census__layout">
                    <div className="dyad-census__pairs">
                      <AnimatePresence
                        custom={[isForwards]}
                        initial={false}
                      >
                        <Pair
                          key={`${promptIndex}_${stepsState.step}`}
                          edgeColor={edgeColor}
                          hasEdge={hasEdge}
                          animateForwards={isForwards}
                          fromNode={fromNode}
                          toNode={toNode}
                        />
                      </AnimatePresence>
                    </div>
                    <motion.div
                      className={choiceClasses}
                      variants={choiceVariants}
                      layout
                      initial="hide"
                      animate="show"
                    >
                      <div className="dyad-census__options">
                        <AnimatePresence exitBeforeEnter>
                          <motion.div
                            key={stepsState.step}
                            className="dyad-census__options-step"
                            variants={optionsVariants}
                            initial="hide"
                            animate="show"
                            exit="hide"
                          >
                            <div className="form-field-container form-field-boolean">
                              <div className="form-field-boolean__control">
                                <div>
                                  <div className="boolean__options">
                                    <BooleanOption
                                      selected={!!hasEdge && hasEdge !== null}
                                      onClick={handleChange(true)}
                                      label={() => <h1>Yes</h1>}
                                    />
                                    <BooleanOption
                                      classes="boolean-option--no"
                                      onClick={handleChange(false)}
                                      selected={!hasEdge && hasEdge !== null}
                                      label={() => <h1>No</h1>}
                                      negative
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          )}
      </AnimatePresence>
    </div>
  );
};

DyadCensus.propTypes = {
  prompt: PropTypes.object.isRequired,
  stage: PropTypes.object.isRequired,
};

const makeMapStateToProps = () => {
  const getNodes = makeGetNodes();

  const mapStateToProps = (state, props) => {
    const nodes = getNodes(state, props);
    const edges = getEdges(state, props);
    const codebook = getProtocolCodebook(state, props);
    const edgeColor = get(codebook, ['edge', props.prompt.createEdge, 'color']);
    const pairs = getPairs(nodes);
    const stageState = getStageState(state);

    return {
      pairs,
      nodes,
      edges,
      edgeColor,
      stageState,
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

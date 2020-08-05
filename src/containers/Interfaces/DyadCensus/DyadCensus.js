import React, { useCallback, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import PropTypes from 'prop-types';
import { get } from 'lodash';
import cx from 'classnames';
import { ProgressBar } from '@codaco/ui';
import { AnimatePresence, motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import defaultMarkdownRenderers from '../../../utils/markdownRenderers';
import { ALLOWED_MARKDOWN_TAGS } from '../../../config';
import withPrompt from '../../../behaviours/withPrompt';
import { makeNetworkNodesForType as makeGetNodes } from '../../../selectors/interface';
import { getNetworkEdges as getEdges } from '../../../selectors/network';
import { getStageState } from '../../../selectors/session';
import { getProtocolCodebook } from '../../../selectors/protocol';
import { actionCreators as navigateActions } from '../../../ducks/modules/navigate';
import PromptSwiper from '../../PromptSwiper';
import { getPairs, getNodePair } from './helpers';
import useSteps from './useSteps';
import useNetworkEdgeState from './useEdgeState';
import useAutoAdvance from './useAutoAdvance';
import Pair from './Pair';
import Button from './Button';

const fadeVariants = {
  show: { opacity: 1, transition: { duration: 0.5 } },
  hide: { opacity: 0, transition: { duration: 0.5 } },
};

const optionsVariants = {
  show: { opacity: 1, transition: { delay: 0.35, duration: 0.25 } },
  hide: { opacity: 0, transition: { delay: 0.35, duration: 0.25 } },
};

const choiceVariants = {
  show: { opacity: 1, translateY: '0%', transition: { delay: 0.25 } },
  hide: { opacity: 0, translateY: '120%' },
};

const introVariants = {
  show: { opacity: 1, scale: 1 },
  hide: { opacity: 0, scale: 0 },
};

const canSkip = false;

/**
  * Dyad Census Interface
  */
const DyadCensus = ({
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
      // If we're on the introduction and also at the end of steps,
      // then there are no pairs and we should go to the next stage.
      // In this case 'onComplete()', would take us to the next prompt
      // which is going to be empty (still no pairs!).
      if (stepsState.isEnd) {
        dispatch(navigateActions.goToNextStage());
        return;
      }
      setIsIntroduction(false);
      return;
    }

    // check value has been set
    if (!canSkip && hasEdge === null) {
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

  const handleChange = nextValue =>
    () => {
      // 'debounce' clicks, one click (isTouched) should start auto-advance
      // so ignore further clicks
      if (isTouched) { return; }
      setEdge(nextValue);
    };

  const choiceClasses = cx(
    'dyad-interface__choice',
    { 'dyad-interface__choice--invalid': !isValid },
  );

  return (
    <div className="dyad-interface">
      <AnimatePresence
        initial={false}
        exitBeforeEnter
      >
        { isIntroduction &&
        <motion.div
          className="dyad-interface__introduction"
          variants={introVariants}
          initial="hide"
          exit="hide"
          animate="show"
          key="intro"
        >
          <h1>{stage.introductionPanel.title}</h1>
          <ReactMarkdown
            source={stage.introductionPanel.text}
            allowedTypes={ALLOWED_MARKDOWN_TAGS}
            renderers={defaultMarkdownRenderers}
          />
        </motion.div>
        }
        { !isIntroduction &&
          <motion.div
            key="content"
            variants={fadeVariants}
            initial="hide"
            exit="hide"
            animate="show"
            className="dyad-interface__wrapper"
          >
            <div className="dyad-interface__prompt">
              <PromptSwiper
                forward={promptForward}
                backward={promptBackward}
                prompt={prompt}
                prompts={stage.prompts}
              />
            </div>
            <AnimatePresence exitBeforeEnter>
              <motion.div
                className="dyad-interface__main"
                key={promptIndex}
                variants={fadeVariants}
                initial="hide"
                exit="hide"
                animate="show"
              >
                <div className="dyad-interface__layout">
                  <div className="dyad-interface__pairs">
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
                    initial="hide"
                    animate="show"
                  >
                    <div className="dyad-interface__progress">
                      <ProgressBar orientation="horizontal" percentProgress={((stepsState.substep + 1) / stepsState.steps[stepsState.stage]) * 100} />
                    </div>
                    <div className="dyad-interface__options">
                      <AnimatePresence exitBeforeEnter>
                        <motion.div
                          key={stepsState.step}
                          className="dyad-interface__options-step"
                          variants={optionsVariants}
                          initial="hide"
                          animate="show"
                          exit="hide"
                        >
                          <div className="dyad-interface__yes">
                            <Button
                              onClick={handleChange(true)}
                              selected={!!hasEdge && hasEdge !== null}
                            >Yes</Button>
                          </div>
                          <div className="dyad-interface__no">
                            <Button
                              onClick={handleChange(false)}
                              selected={!hasEdge && hasEdge !== null}
                              className="no"
                            >No</Button>
                          </div>
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        }
      </AnimatePresence>
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

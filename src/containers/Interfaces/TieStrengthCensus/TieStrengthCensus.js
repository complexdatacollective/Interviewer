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
  show: { opacity: 1, transition: { delay: 0.35, duration: 0.25 } },
  hide: { opacity: 0, transition: { delay: 0.35, duration: 0.25 } },
};

const choiceVariants = {
  show: { opacity: 1, translateY: '0%', transition: { delay: 0.25, type: 'spring' } },
  hide: { opacity: 0, translateY: '120%' },
};

const introVariants = {
  show: { opacity: 1, scale: 1 },
  hide: { opacity: 0, scale: 0 },
};

/**
  * Dyad Census Interface
  */
const TieStrengthCensus = (props) => {
  const {
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
    edgeVariableOptions,
  } = props;

  const {
    createEdge, // Edge type to create
    edgeVariable, // Edge variable to set value of
    negativeLabel, // Label for the "reject" option
  } = prompt;

  const [isIntroduction, setIsIntroduction] = useState(true);
  const [isForwards, setForwards] = useState(true);
  const [isValid, setIsValid] = useState(true);

  // Number of pairs times number of prompts e.g. `[3, 3, 3]`
  const steps = Array(stage.prompts.length).fill(get(pairs, 'length', 0));
  const [stepsState, nextStep, previousStep] = useSteps(steps);

  const pair = get(pairs, stepsState.substep, null);
  const [fromNode, toNode] = getNodePair(nodes, pair);

  // hasEdge:
  //  - false: user denied
  //  - null: not yet decided
  //  - true: edge exists
  const [hasEdge, edgeVariableValue, setEdge, isTouched, isChanged] = useNetworkEdgeState(
    dispatch,
    edges,
    createEdge, // Type of edge to create
    edgeVariable, // Edge ordinal variable
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

    // check that the edgeVariable has a value
    // hasEdge is false when user has declined, but null when it doesn't exist yet
    // edgeVariableValue is null when edge doesn't exist, or variable isn't set
    if (hasEdge === null && edgeVariableValue === null) {
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
    'tie-strength-census__choice',
    { 'tie-strength-census__choice--invalid': !isValid },
  );

  return (
    <div className="tie-strength-census">
      <AnimatePresence
        initial={false}
        exitBeforeEnter
      >
        {isIntroduction
          && (
            <motion.div
              className="tie-strength-census__introduction"
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
              className="tie-strength-census__wrapper"
            >
              <div className="tie-strength-census__prompt">
                <Prompts
                  currentPrompt={stage.prompts[promptIndex].id}
                  prompts={stage.prompts}
                />
              </div>
              <AnimatePresence exitBeforeEnter>
                <motion.div
                  className="tie-strength-census__main"
                  key={promptIndex}
                  variants={fadeVariants}
                  initial="hide"
                  exit="hide"
                  animate="show"
                >
                  <div className="tie-strength-census__layout">
                    <div className="tie-strength-census__pairs">
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
                      style={{
                        // Set the max width of the container based on the number of options
                        // This prevents them getting too wide, but also ensures that they
                        // expand to take up all available space.
                        maxWidth: `${((edgeVariableOptions.length + 1) * 20) + 3.6}rem`,
                      }}
                    >
                      <div className="tie-strength-census__options">
                        <AnimatePresence exitBeforeEnter>
                          <motion.div
                            key={stepsState.step}
                            className="tie-strength-census__options-step"
                            variants={optionsVariants}
                            initial="hide"
                            animate="show"
                            exit="hide"
                          >
                            <div className="form-field-container form-field-boolean">
                              <div className="form-field-boolean__control">
                                <div>
                                  <div className="boolean__options">
                                    {edgeVariableOptions.map((option) => (
                                      <BooleanOption
                                        key={option.value}
                                        selected={!!hasEdge && edgeVariableValue === option.value}
                                        onClick={handleChange(option.value)}
                                        label={option.label}
                                      />
                                    ))}
                                    <BooleanOption
                                      classes="boolean-option--no"
                                      // Has edge is null if not set and false if user rejected
                                      selected={!hasEdge && hasEdge === false}
                                      onClick={handleChange(false)}
                                      label={negativeLabel}
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

TieStrengthCensus.propTypes = {
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
    const edgeVariableOptions = get(codebook, ['edge', props.prompt.createEdge, 'variables', props.prompt.edgeVariable, 'options'], []);
    const pairs = getPairs(nodes);
    const stageState = getStageState(state);

    return {
      pairs,
      nodes,
      edges,
      edgeColor,
      stageState,
      edgeVariableOptions,
    };
  };

  return mapStateToProps;
};

export default compose(
  withPrompt,
  connect(makeMapStateToProps),
)(TieStrengthCensus);

export {
  TieStrengthCensus as UnconnectedTieStrengthCensus,
};

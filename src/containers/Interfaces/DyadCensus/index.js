import React, { useCallback, useEffect } from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import PropTypes from 'prop-types';
import { get } from 'lodash';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@codaco/ui';
import RadioGroup from '@codaco/ui/lib/components/Fields/RadioGroup';
import withPrompt from '../../../behaviours/withPrompt';
import { entityPrimaryKeyProperty } from '../../../ducks/modules/network';
import { makeNetworkNodesForType as makeGetNodes } from '../../../selectors/interface';
import { getNetworkEdges as getEdges } from '../../../selectors/network';
import { getProtocolCodebook } from '../../../selectors/protocol';
import ProgressBar from '../../../components/ProgressBar';
import PromptSwiper from '../../PromptSwiper';
import Node from '../../../containers/Node';
import useSteps from './useSteps';
import useEdgeState from './useEdgeState';

const transition = {
  duration: 1,
};

const variants = {
  in: {
    translateY: '0%',
    opacity: 1,
    position: 'static',
    transition,
  },
  initial: isForwards => ({
    translateY: isForwards ? '100%' : '-100%',
    opacity: 0,
    position: 'absolute',
    transition,
  }),
  exit: isForwards => ({
    translateY: !isForwards ? '100%' : '-100%',
    opacity: 0,
    position: 'absolute',
    transition,
  }),
};

const edgeVariants = {
  show: { opacity: 1 },
  hide: { opacity: 0 },
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
    promptIndex || 0,
    { onComplete, dispatch },
  );

  const [edgeState, setEdgeState, updateNetwork] = useEdgeState(
    prompt.edge, // TODO: createEdge?
    { dispatch },
    [promptIndex, state.step],
  );

  // TODO: extract these getters into single function, possible useEdgeState
  const getCurrentPair = () => pairs[state.step];
  const getNode = id =>
    nodes.find(node => node[entityPrimaryKeyProperty] === id);

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

  const pair = getCurrentPair();
  const fromNode = getNode(pair[0]);
  const toNode = getNode(pair[1]);
  const isForwards = state.direction !== 'backward'; // .i.e. default to true

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
        <div className="dyad-interface__pairs">
          <AnimatePresence custom={isForwards}>
            <motion.div
              className="dyad-interface__pair"
              key={`${promptIndex}_${state.step}`}
              custom={isForwards}
              variants={variants}
              initial="initial"
              animate="in"
              exit="exit"
            >
              <div className="dyad-interface__nodes">
                <Node {...fromNode} />
                <motion.div
                  className="dyad-interface__edge"
                  style={{ backgroundColor: `var(--${edgeColor})` }}
                  variants={edgeVariants}
                  initial="hide"
                  animate={getHasEdge() ? 'show' : 'hide'}
                />
                <Node {...toNode} />
              </div>
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
        <div>
          <h6 className="progress-container__status-text">
            <strong>{state.step + 1}</strong> of <strong>{pairs.length}</strong>
          </h6>
          <ProgressBar orientation="horizontal" percentProgress={((state.step + 1) / pairs.length) * 100} />
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

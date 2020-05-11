import React, { useCallback, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import PropTypes from 'prop-types';
import withPrompt from '../../behaviours/withPrompt';
import { actionCreators as sessionsActions } from '../../ducks/modules/sessions';
import { entityPrimaryKeyProperty } from '../../ducks/modules/network';
import {
  makeNetworkNodesForPrompt as makeGetNodesForPrompt,
} from '../../selectors/interface';
import { PromptSwiper } from '../';

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
}) => {
  const [pairIndex, setPairIndex] = useState(0);

  // TODO: Should this also receive an onComplete method?
  const beforeNext = useCallback((direction) => {
    if (direction < 0) {
      if (pairIndex > 0) {
        setPairIndex(n => n - 1);
        return;
      }
    }

    if (direction > 1) {
      console.log('yes or no only!');
      return;
    }

    onComplete();
  }, [pairIndex, setPairIndex]);

  useEffect(() => {
    registerBeforeNext(beforeNext);
  }, [beforeNext]);

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
        <p>{pairs.length}</p>
        <p>{JSON.stringify(pairs[pairIndex])}</p>
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
  updateNode: PropTypes.func.isRequired,
};

const makeMapStateToProps = () => {
  const getNodesForPrompt = makeGetNodesForPrompt();

  const mapStateToProps = (state, props) => {
    const nodes = getNodesForPrompt(state, props);
    const nodeIds = nodes.map(node => node[entityPrimaryKeyProperty]);

    const pairs = nodeIds.flatMap(
      id =>
        nodeIds
          .filter(alterId => alterId !== id)
          .map(alterId => ([id, alterId])),
    );

    return {
      pairs,
      nodes,
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

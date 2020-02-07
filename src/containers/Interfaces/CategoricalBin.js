import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withStateHandlers } from 'recompose';
import PropTypes from 'prop-types';
import withPrompt from '../../behaviours/withPrompt';
import { PromptSwiper, CategoricalList } from '../';
import { makeGetPromptVariable, makeNetworkNodesForType } from '../../selectors/interface';
import { MultiNodeBucket } from '../../components';
import { entityAttributesProperty } from '../../ducks/modules/network';

const categoricalBinStateHandler = withStateHandlers(
  {
    expandedBinValue: '',
  },
  {
    handleExpandBin: () =>
      (expandedBinValue = '') => ({ expandedBinValue }),
  },
);

/**
  * CategoricalBin Interface
  */
const CategoricalBin = ({
  promptForward,
  promptBackward,
  prompt,
  nodesForPrompt,
  expandedBinValue,
  handleExpandBin,
  stage,
}) => {
  const {
    prompts,
  } = stage;
  return (
    <div className="categorical-bin-interface">
      <div className="categorical-bin-interface__prompt">
        <PromptSwiper
          forward={promptForward}
          backward={promptBackward}
          prompt={prompt}
          prompts={prompts}
        />
      </div>
      <div className="categorical-bin-interface__bucket" onClick={() => handleExpandBin()}>
        <MultiNodeBucket
          nodes={nodesForPrompt}
          listId={`${stage.id}_${prompt.id}_CAT_BUCKET`}
          sortOrder={prompt.bucketSortOrder}
        />
      </div>
      <CategoricalList
        key={prompt.id}
        stage={stage}
        prompt={prompt}
        expandedBinValue={expandedBinValue}
        onExpandBin={handleExpandBin}
      />
    </div>
  );
};

CategoricalBin.propTypes = {
  stage: PropTypes.object.isRequired,
  prompt: PropTypes.object.isRequired,
  promptForward: PropTypes.func.isRequired,
  promptBackward: PropTypes.func.isRequired,
  nodesForPrompt: PropTypes.array.isRequired,
  expandedBinValue: PropTypes.string.isRequired,
  handleExpandBin: PropTypes.func.isRequired,
};

function makeMapStateToProps() {
  const getStageNodes = makeNetworkNodesForType();
  const getPromptVariable = makeGetPromptVariable();

  return function mapStateToProps(state, props) {
    const stageNodes = getStageNodes(state, props);
    const activePromptVariable = getPromptVariable(state, props);

    return {
      activePromptVariable,
      nodesForPrompt: stageNodes.filter(
        node => !node[entityAttributesProperty][activePromptVariable],
      ),
    };
  };
}

export { CategoricalBin as UnconnectedCategoricalBin };

export default compose(
  withPrompt,
  connect(makeMapStateToProps),
  categoricalBinStateHandler,
)(CategoricalBin);

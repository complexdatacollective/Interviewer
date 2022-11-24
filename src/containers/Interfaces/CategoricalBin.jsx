import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withStateHandlers } from 'recompose';
import PropTypes from 'prop-types';
import { entityAttributesProperty } from '@codaco/shared-consts';
import Prompts from '../../components/Prompts';
import withPrompt from '../../behaviours/withPrompt';
import CategoricalList from '../CategoricalList';
import { makeGetPromptVariable, getPromptOtherVariable, makeNetworkNodesForType } from '../../selectors/interface';
import MultiNodeBucket from '../../components/MultiNodeBucket';

const categoricalBinStateHandler = withStateHandlers(
  {
    expandedBinIndex: null,
  },
  {
    handleExpandBin: () => (expandedBinIndex = null) => ({ expandedBinIndex }),
  },
);

/**
  * CategoricalBin Interface
  */
const CategoricalBin = ({
  prompt,
  uncategorizedNodes,
  expandedBinIndex,
  handleExpandBin,
  stage,
}) => {
  const {
    prompts,
  } = stage;
  return (
    <div className="categorical-bin-interface">
      <div className="categorical-bin-interface__prompt">
        <Prompts
          prompts={prompts}
          currentPrompt={prompt.id}
        />
      </div>
      <div className="categorical-bin-interface__bucket" onClick={() => handleExpandBin()}>
        <MultiNodeBucket
          nodes={uncategorizedNodes}
          listId={`${stage.id}_${prompt.id}_CAT_BUCKET`}
          sortOrder={prompt.bucketSortOrder}
        />
      </div>
      <CategoricalList
        key={prompt.id}
        stage={stage}
        prompt={prompt}
        expandedBinIndex={expandedBinIndex}
        onExpandBin={handleExpandBin}
      />
    </div>
  );
};

CategoricalBin.propTypes = {
  stage: PropTypes.object.isRequired,
  prompt: PropTypes.object.isRequired,
  uncategorizedNodes: PropTypes.array.isRequired,
  expandedBinIndex: PropTypes.number,
  handleExpandBin: PropTypes.func.isRequired,
};

CategoricalBin.defaultProps = {
  expandedBinIndex: null,
};

function makeMapStateToProps() {
  const getStageNodes = makeNetworkNodesForType();
  const getPromptVariable = makeGetPromptVariable();

  return function mapStateToProps(state, props) {
    const stageNodes = getStageNodes(state, props);
    const activePromptVariable = getPromptVariable(state, props);
    const [promptOtherVariable] = getPromptOtherVariable(state, props);

    const matchNoCategory = (node) => !node[entityAttributesProperty][activePromptVariable]
      && !node[entityAttributesProperty][promptOtherVariable];

    return {
      activePromptVariable,
      uncategorizedNodes: stageNodes.filter(matchNoCategory),
    };
  };
}

export { CategoricalBin as UnconnectedCategoricalBin };

export default compose(
  withPrompt,
  connect(makeMapStateToProps),
  categoricalBinStateHandler,
)(CategoricalBin);

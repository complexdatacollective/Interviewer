import React from 'react';
import { compose } from 'redux';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import withPrompt from '../../../behaviours/withPrompt';
import PromptSwiper from '../../PromptSwiper';
import withExternalData from '../../withExternalData';
import Card from '../../../components/Card';
import { makeNetworkNodesForPrompt, makeGetAdditionalAttributes } from '../../../selectors/interface';
import { makeGetPromptNodeModelData } from '../../../selectors/name-generator';
import { entityPrimaryKeyProperty } from '../../../ducks/modules/network';
import { actionCreators as sessionsActions } from '../../../ducks/modules/sessions';
import NodeList from '../../../components/NodeList';
import SearchableList from './SearchableList';
import usePropSelector from './usePropSelector';
import useItems from './useItems';
import useSortableProperties from './useSortableProperties';

/**
  * Name Generator List Interface
  */
const NameGeneratorList = (props) => {
  const {
    prompt,
    promptBackward,
    promptForward,
    stage,
  } = props;

  const {
    prompts,
  } = stage;

  const dispatch = useDispatch();
  const newNodeAttributes = usePropSelector(makeGetAdditionalAttributes, props, true);
  const newNodeModelData = usePropSelector(makeGetPromptNodeModelData, props, true);
  const nodesForPrompt = usePropSelector(makeNetworkNodesForPrompt, props, true);

  const items = useItems(props);
  const sortableProperties = useSortableProperties(stage);

  const handleAddNode = ({ meta }) => {
    const { id, data } = meta;
    const attributeData = {
      ...newNodeAttributes,
      ...data,
    };

    const modelData = {
      ...newNodeModelData,
      id,
    };

    console.log('add', { data, modelData, attributeData });

    dispatch(sessionsActions.addNode(modelData, attributeData));
  };

  const handleRemoveNode = ({ meta }) => {
    const id = meta[entityPrimaryKeyProperty];

    console.log('remove', { meta });

    dispatch(sessionsActions.removeNode(id));
  };

  return (
    <div className="name-generator-list-interface">
      <div className="name-generator-list-interface__prompt">
        <PromptSwiper
          forward={promptForward}
          backward={promptBackward}
          prompt={prompt}
          prompts={prompts}
        />
      </div>

      <div className="name-generator-list-interface__panels">
        {items.length === 0 && (
          <div>Loading</div>
        )}
        {items.length > 0 && (
          <>
            <div className="name-generator-list-interface__nodes">
              <NodeList
                id="node-drop-area"
                accepts={() => true}
                onDrop={handleAddNode}
                items={nodesForPrompt}
              />
            </div>
            <div className="name-generator-list-interface__list">
              <SearchableList
                items={items}
                itemComponent={Card}
                sortableProperties={sortableProperties}
                onDrop={handleRemoveNode}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

NameGeneratorList.propTypes = {
  prompt: PropTypes.object.isRequired,
  promptForward: PropTypes.func.isRequired,
  promptBackward: PropTypes.func.isRequired,
  stage: PropTypes.object.isRequired,
};

NameGeneratorList.defaultProps = {

};

export default compose(
  withPrompt,
  withExternalData('stage.dataSource', 'externalData'),
)(NameGeneratorList);

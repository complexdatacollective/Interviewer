import React from 'react';
import { compose } from 'redux';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { getCSSVariableAsNumber } from '@codaco/ui/lib/utils/CSSVariables';
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
      [entityPrimaryKeyProperty]: id,
    };

    console.log('add', { data, modelData, attributeData });

    dispatch(sessionsActions.addNode(modelData, attributeData));
  };

  const handleRemoveNode = ({ meta }) => {
    const id = meta[entityPrimaryKeyProperty];

    console.log('remove', { meta });

    dispatch(sessionsActions.removeNode(id));
  };

  const animationDuration = getCSSVariableAsNumber('--animation-duration-standard-ms') / 1000;

  const variants = {
    visible: {
      opacity: 1,
      transition: { duration: animationDuration, delay: animationDuration },
    },
    hidden: { opacity: 0, transition: { duration: animationDuration } },
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
        <AnimatePresence>
          {items.length === 0 && (
            <motion.div
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={variants}
              key="loading"
            >
              Loading
            </motion.div>
          )}
          {items.length > 0 && [
            <motion.div
              className="name-generator-list-interface__nodes"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={variants}
              key="node-list"
            >
              <NodeList
                id="node-drop-area"
                accepts={() => true}
                onDrop={handleAddNode}
                items={nodesForPrompt}
              />
            </motion.div>,
            <motion.div
              className="name-generator-list-interface__list"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={variants}
              key="search-list"
            >
              <SearchableList
                items={items}
                itemComponent={Card}
                sortableProperties={sortableProperties}
                onDrop={handleRemoveNode}
              />
            </motion.div>,
          ]}
        </AnimatePresence>
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

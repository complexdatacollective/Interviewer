import React from 'react';
import { compose } from 'redux';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { motion, AnimatePresence } from 'framer-motion';
import { getCSSVariableAsNumber } from '@codaco/ui/lib/utils/CSSVariables';
import { Node } from '@codaco/ui';
import withPrompt from '../../../behaviours/withPrompt';
import PromptSwiper from '../../PromptSwiper';
import withExternalData from '../../withExternalData';
import Card from '../../../components/Card';
import { makeNetworkNodesForPrompt, makeGetAdditionalAttributes } from '../../../selectors/interface';
import { makeGetPromptNodeModelData } from '../../../selectors/name-generator';
import { entityPrimaryKeyProperty } from '../../../ducks/modules/network';
import { actionCreators as sessionsActions } from '../../../ducks/modules/sessions';
import NodeList from '../../../components/NodeList';
import Panel from '../../../components/Panel';
import Loading from '../../../components/Loading';
import useDropMonitor from '../../../behaviours/DragAndDrop/useDropMonitor';
import SearchableList from '../../SearchableList';
import usePropSelector from './usePropSelector';
import useFuseOptions from './useFuseOptions';
import useSortableProperties from './useSortableProperties';
import useItems from './useItems';

const NodePreview = ({ label }) => (
  <Node label={label} />
);

const Overlay = ({ children, variants }) => (
  <motion.div
    className="name-generator-list-interface__overlay"
    variants={variants}
    initial="hidden"
    animate="visible"
    exit="hidden"
  >
    {children}
  </motion.div>
);

const WillAccept = () => (
  <>Drop here to remove from your interview</>
);
const WillDelete = () => (
  <>Dropping here will remove it from your interview</>
);

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

  const sortOptions = useSortableProperties(stage.sortOptions);
  const searchOptions = useFuseOptions(stage.searchOptions);

  const [items, excludeItems] = useItems(props);

  const { isOver, willAccept } = useDropMonitor('node-drop-area')
    || { isOver: false, willAccept: false };

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

    dispatch(sessionsActions.addNode(modelData, attributeData));
  };

  const handleRemoveNode = ({ meta }) => {
    const id = meta[entityPrimaryKeyProperty];

    dispatch(sessionsActions.removeNode(id));
  };

  const animationDuration = getCSSVariableAsNumber('--animation-duration-standard-ms') / 1000;

  const variants = {
    visible: {
      opacity: 1,
      transition: { duration: animationDuration },
    },
    hidden: { opacity: 0, transition: { duration: animationDuration } },
  };

  const overlayVariants = {
    visible: { opacity: 1, transition: { duration: animationDuration } },
    hidden: { opacity: 0, transition: { duration: animationDuration } },
  };

  const showWillAccept = willAccept && !isOver;
  const showWillDelete = willAccept && isOver;

  const nodeListClasses = cx(
    'name-generator-list-interface__node-list',
    { 'name-generator-list-interface__node-list--empty': nodesForPrompt.length === 0 },
  );

  return (
    <div className="name-generator-list-interface">
      <AnimatePresence>
        {items.length === 0 && (
          <motion.div
            className="name-generator-list-interface__loading"
            initial="visible"
            animate="visible"
            exit="hidden"
            variants={variants}
            key="loading"
          >
            <Loading message="Loading roster data..." />
          </motion.div>
        )}
        {items.length > 0 && [
          <motion.div
            className="name-generator-list-interface__prompt"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={variants}
            key="prompts"
          >
            <PromptSwiper
              forward={promptForward}
              backward={promptBackward}
              prompt={prompt}
              prompts={prompts}
            />
          </motion.div>,
          <motion.div
            className="name-generator-list-interface__panels"
            key="panels"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={variants}
          >
            <div className="name-generator-list-interface__node-panel">
              <Panel
                title="Added to your interview"
                noHighlight
                noCollapse
              >
                <div className="name-generator-list-interface__node-list">
                  <NodeList
                    className={nodeListClasses}
                    id="node-drop-area"
                    listId="node-drop-area"
                    itemType="ADDED_NODES"
                    accepts={({ meta: { itemType } }) => itemType !== 'ADDED_NODES'}
                    onDrop={handleAddNode}
                    items={nodesForPrompt}
                  />
                  <AnimatePresence>
                    { willAccept && (
                      <Overlay variants={overlayVariants}>
                        { showWillAccept && <WillAccept />}
                        { showWillDelete && <WillDelete />}
                      </Overlay>
                    )}
                  </AnimatePresence>
                </div>
              </Panel>
            </div>
            <div className="name-generator-list-interface__search-panel">
              <SearchableList
                items={items}
                excludeItems={excludeItems}
                itemComponent={Card}
                dragPreviewComponent={NodePreview}
                sortOptions={sortOptions}
                searchOptions={searchOptions}
                itemType="SOURCE_NODES"
                accepts={({ meta: { itemType } }) => itemType !== 'SOURCE_NODES'}
                onDrop={handleRemoveNode}
              />
            </div>
          </motion.div>,
        ]}
      </AnimatePresence>
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

import React, { useMemo } from 'react';
import { compose } from 'redux';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { motion, AnimatePresence } from 'framer-motion';
import { Node } from '@codaco/ui';
import { DataCard } from '@codaco/ui/lib/components/Cards';
import withPrompt from '../../../behaviours/withPrompt';
import PromptSwiper from '../../PromptSwiper';
import { makeNetworkNodesForPrompt, makeGetAdditionalAttributes } from '../../../selectors/interface';
import { makeGetPromptNodeModelData } from '../../../selectors/name-generator';
import { entityPrimaryKeyProperty } from '../../../ducks/modules/network';
import { actionCreators as sessionsActions } from '../../../ducks/modules/sessions';
import { getNodeLabel, getNodeColor } from '../../../selectors/network';
import NodeList from '../../../components/NodeList';
import Panel from '../../../components/Panel';
import Loading from '../../../components/Loading';
import useAnimationSettings from '../../../hooks/useAnimationSettings';
import useDropMonitor from '../../../behaviours/DragAndDrop/useDropMonitor';
import SearchableList from '../../SearchableList';
import usePropSelector from './usePropSelector';
import useFuseOptions from './useFuseOptions';
import useSortableProperties from './useSortableProperties';
import useItems from './useItems';

const countColumns = (width) => (
  width < 140 ? 1 : Math.floor(width / 450)
);

const nodePreviewForType = (nodeType) => ({ meta }) => {
  const getLabel = useSelector((state) => getNodeLabel(state, nodeType));
  const color = useSelector(getNodeColor(nodeType));
  return <Node label={getLabel(meta.data)} color={color} />;
};

const DropOverlay = ({ isOver, nodeColor }) => {
  const { duration } = useAnimationSettings();

  const variants = {
    visible: { opacity: 1, transition: { duration: duration.standard } },
    hidden: { opacity: 0, transition: { duration: duration.standard } },
  };

  const iconVariants = {
    over: {
      scale: [1, 1.2],
      transition: { duration: duration.slow, repeat: Infinity, repeatType: 'reverse' },
    },
    initial: {
      scale: 1,
      transition: { duration: duration.fast },
    },
  };

  return (
    <motion.div
      className="name-generator-list-interface__overlay"
      variants={variants}
      initial="hidden"
      animate="visible"
      exit="hidden"
    >
      <motion.div
        variants={iconVariants}
        initial="initial"
        animate={isOver ? 'over' : 'initial'}
      >
        <Node label="" color={nodeColor} />
      </motion.div>
      <p>Drop here to add to network</p>
    </motion.div>
  );
};

const ErrorMessage = ({ error }) => (
  <div
    style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
    }}
  >
    <h1>Something went wrong</h1>
    <p>External data could not be loaded.</p>
    <p><small>{error.toString()}</small></p>
  </div>
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

  const nodeType = stage && stage.subject && stage.subject.type;

  const NodePreview = useMemo(() => nodePreviewForType(nodeType), [nodeType]);

  const dispatch = useDispatch();
  const newNodeAttributes = usePropSelector(makeGetAdditionalAttributes, props, true);
  const newNodeModelData = usePropSelector(makeGetPromptNodeModelData, props, true);
  const nodesForPrompt = usePropSelector(makeNetworkNodesForPrompt, props, true);
  const dropNodeColor = useSelector(getNodeColor(nodeType));

  const sortOptions = useSortableProperties(stage.sortOptions);
  const searchOptions = useFuseOptions(stage.searchOptions);

  const { duration } = useAnimationSettings();
  const [itemsStatus, items, excludeItems] = useItems(props);

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

  const variants = {
    visible: {
      opacity: 1,
      transition: { duration: duration.standard },
    },
    hidden: { opacity: 0, transition: { duration: duration.standard } },
  };

  const nodeListClasses = cx(
    'name-generator-list-interface__node-list',
    { 'name-generator-list-interface__node-list--empty': nodesForPrompt.length === 0 },
  );

  return (
    <div className="name-generator-list-interface">
      <AnimatePresence>
        {itemsStatus.isLoading && (
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
        {!itemsStatus.isLoading && [
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
                    hoverColor="transparent"
                  />
                  <AnimatePresence>
                    { willAccept && (
                      <DropOverlay isOver={isOver} nodeColor={dropNodeColor} />
                    )}
                  </AnimatePresence>
                </div>
              </Panel>
            </div>
            <div className="name-generator-list-interface__search-panel">
              <SearchableList
                items={items}
                title="Available to add"
                columns={countColumns}
                placeholder={itemsStatus.error && <ErrorMessage error={itemsStatus.error} />}
                itemType="SOURCE_NODES" // drop type
                excludeItems={excludeItems}
                itemComponent={DataCard}
                dragComponent={NodePreview}
                sortOptions={sortOptions}
                searchOptions={searchOptions}
                accepts={({ meta: { itemType } }) => itemType !== 'SOURCE_NODES'}
                onDrop={handleRemoveNode}
                dropNodeColor={dropNodeColor}
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
  // withExternalData('stage.dataSource', 'externalData'),
)(NameGeneratorList);

import React, { useMemo } from 'react';
import { compose } from 'redux';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { motion, AnimatePresence } from 'framer-motion';
import { get, isEmpty } from 'lodash';
import { Node as UINode } from '@codaco/ui';
import { DataCard } from '@codaco/ui/lib/components/Cards';
import Prompts from '../../../components/Prompts';
import withPrompt from '../../../behaviours/withPrompt';
import { makeNetworkNodesForPrompt, makeGetAdditionalAttributes, makeGetNodeVariables } from '../../../selectors/interface';
import { makeGetPromptNodeModelData } from '../../../selectors/name-generator';
import { entityPrimaryKeyProperty, entityAttributesProperty } from '../../../ducks/modules/network';
import { actionCreators as sessionsActions } from '../../../ducks/modules/sessions';
import { getNodeColor } from '../../../selectors/network';
import List from '../../../components/List';
import Panel from '../../../components/Panel';
import Loading from '../../../components/Loading';
import useAnimationSettings from '../../../hooks/useAnimationSettings';
import useDropMonitor from '../../../behaviours/DragAndDrop/useDropMonitor';
import Node from '../../Node';
import SearchableList from '../../SearchableList';
import usePropSelector from './usePropSelector';
import useFuseOptions from './useFuseOptions';
import useSortableProperties from './useSortableProperties';
import useItems from './useItems';
import { convertNamesToUUIDs } from './helpers';

const countColumns = (width) => (
  width < 140 ? 1 : Math.floor(width / 450)
);
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
      className="name-generator-roster-interface__overlay"
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
        <UINode label="" color={nodeColor} />
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
  * Name Generator (unified) Roster Interface
  */
const NameGeneratorRoster = (props) => {
  const {
    prompt,
    stage,
  } = props;

  const {
    prompts,
  } = stage;

  const dispatch = useDispatch();
  const { duration } = useAnimationSettings();

  const newNodeAttributes = usePropSelector(makeGetAdditionalAttributes, props, true);
  const newNodeModelData = usePropSelector(makeGetPromptNodeModelData, props, true);
  const nodesForPrompt = usePropSelector(makeNetworkNodesForPrompt, props, true);
  const nodeVariables = usePropSelector(makeGetNodeVariables, props, true);
  const nodeType = stage && stage.subject && stage.subject.type;
  const dropNodeColor = useSelector(getNodeColor(nodeType));

  const [itemsStatus, items, excludeItems] = useItems(props);

  const sortOptions = useSortableProperties(nodeVariables, stage.sortOptions);

  const searchOptions = ((options) => {
    if (!options || isEmpty(options)) { return options; }

    return {
      ...options,
      matchProperties: convertNamesToUUIDs(nodeVariables, get(stage, 'searchOptions.matchProperties')),
    };
  })(stage.searchOptions);

  const fallbackKeys = useMemo(
    () => Object
      .keys(
        get(items, [0, 'data', entityAttributesProperty], {}),
      )
      .map((attribute) => ['data', entityAttributesProperty, attribute]),
    [items],
  );

  const fuseOptions = useFuseOptions(
    searchOptions,
    {
      keys: fallbackKeys,
      threshold: 0,
    },
  );

  const { isOver, willAccept } = useDropMonitor('node-drop-area')
    || { isOver: false, willAccept: false };

  const handleAddNode = ({ meta }) => {
    const { id, data } = meta;
    const attributeData = {
      ...newNodeAttributes,
      ...data.attributes,
    };

    const modelData = {
      ...newNodeModelData,
      [entityPrimaryKeyProperty]: id,
    };

    dispatch(sessionsActions.addNode(modelData, attributeData));
  };

  const handleRemoveNode = ({ meta: { id } }) => {
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
    'name-generator-roster-interface__node-list',
    { 'name-generator-roster-interface__node-list--empty': nodesForPrompt.length === 0 },
  );

  return (
    <div className="name-generator-roster-interface">
      <AnimatePresence>
        {itemsStatus.isLoading && (
          <motion.div
            className="name-generator-roster-interface__loading"
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
            className="name-generator-roster-interface__prompt"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={variants}
            key="prompts"
          >
            <Prompts
              prompts={prompts}
              currentPrompt={prompt.id}
            />
          </motion.div>,
          <motion.div
            className="name-generator-roster-interface__panels"
            key="panels"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={variants}
          >
            <div className="name-generator-roster-interface__search-panel">
              <SearchableList
                id="searchable-list"
                items={items}
                title="Available to add"
                columns={countColumns}
                placeholder={itemsStatus.error && <ErrorMessage error={itemsStatus.error} />}
                itemType="SOURCE_NODES" // drop type
                excludeItems={excludeItems}
                itemComponent={DataCard}
                dragComponent={Node}
                sortOptions={sortOptions}
                searchOptions={fuseOptions}
                accepts={({ meta: { itemType } }) => itemType !== 'SOURCE_NODES'}
                onDrop={handleRemoveNode}
                dropNodeColor={dropNodeColor}
              />
            </div>
            <div className="name-generator-roster-interface__node-panel">
              <Panel
                title="Added to your interview"
                noHighlight
                noCollapse
              >
                <div className="name-generator-roster-interface__node-list">
                  <List
                    id="node-list"
                    className={nodeListClasses}
                    itemType="ADDED_NODES"
                    accepts={({ meta: { itemType } }) => itemType !== 'ADDED_NODES'}
                    onDrop={handleAddNode}
                    items={nodesForPrompt.map(
                      (item) => ({
                        id: item._uid, // eslint-disable-line no-underscore-dangle
                        data: item,
                        props: item,
                      }),
                    )}
                    itemComponent={Node}
                  />
                  <AnimatePresence>
                    { willAccept && (
                      <DropOverlay isOver={isOver} nodeColor={dropNodeColor} />
                    )}
                  </AnimatePresence>
                </div>
              </Panel>
            </div>
          </motion.div>,
        ]}
      </AnimatePresence>
    </div>
  );
};

NameGeneratorRoster.propTypes = {
  prompt: PropTypes.object.isRequired,
  stage: PropTypes.object.isRequired,
};

NameGeneratorRoster.defaultProps = {

};

export default compose(
  withPrompt,
)(NameGeneratorRoster);

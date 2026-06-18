import cx from 'classnames';
import { AnimatePresence, motion } from 'framer-motion';
import { isEmpty, isUndefined } from 'lodash';
import PropTypes from 'prop-types';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { compose } from 'redux';

import {
  entityAttributesProperty,
  entityPrimaryKeyProperty,
} from '@codaco/shared-consts';
import { DataCard } from '@codaco/ui/lib/components/Cards';

import useDropMonitor from '../../../behaviours/DragAndDrop/useDropMonitor';
import withPrompt from '../../../behaviours/withPrompt';
import List from '../../../components/List';
import Loading from '../../../components/Loading';
import Panel from '../../../components/Panel';
import Prompts from '../../../components/Prompts';
import { actionCreators as sessionsActions } from '../../../ducks/modules/sessions';
import useAnimationSettings from '../../../hooks/useAnimationSettings';
import {
  makeGetAdditionalAttributes,
  makeGetNodeVariables,
  makeGetStageNodeCount,
  makeNetworkNodesForPrompt,
} from '../../../selectors/interface';
import { makeGetPromptNodeModelData } from '../../../selectors/name-generator';
import { getNodeColor } from '../../../selectors/network';
import { get } from '../../../utils/lodash-replacements';
import Node from '../../Node';
import SearchableList from '../../SearchableList';
import {
  MaxNodesMet,
  MinNodesNotMet,
  maxNodesWithDefault,
  minNodesWithDefault,
} from '../utils/StageLevelValidation';
import DropOverlay from './DropOverlay';
import { convertNamesToUUIDs } from './helpers';
import useFuseOptions from './useFuseOptions';
import useItems from './useItems';
import usePropSelector from './usePropSelector';
import useSortableProperties from './useSortableProperties';

const countColumns = (width) => (width < 140 ? 1 : Math.floor(width / 450));

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
    <p>
      <small>{error.toString()}</small>
    </p>
  </div>
);

/**
 * Name Generator (unified) Roster Interface
 */
const NameGeneratorRoster = (props) => {
  const {
    prompt,
    stage,
    registerBeforeNext,
    onComplete,
    isFirstPrompt,
    isLastPrompt,
  } = props;

  const { prompts } = stage;

  const interfaceRef = useRef(null);

  const dispatch = useDispatch();
  const { duration } = useAnimationSettings();

  const newNodeAttributes = usePropSelector(
    makeGetAdditionalAttributes,
    props,
    true,
  );
  const newNodeModelData = usePropSelector(
    makeGetPromptNodeModelData,
    props,
    true,
  );
  const nodesForPrompt = usePropSelector(
    makeNetworkNodesForPrompt,
    props,
    true,
  );
  const nodeVariables = usePropSelector(makeGetNodeVariables, props, true);
  const nodeType = stage?.subject?.type;
  const dropNodeColor = useSelector(getNodeColor(nodeType));

  const [itemsStatus, items, excludeItems] = useItems(props);

  const sortOptions = useSortableProperties(nodeVariables, stage.sortOptions);

  const stageNodeCount = usePropSelector(makeGetStageNodeCount, props, true);
  const minNodes = minNodesWithDefault(
    get(props, ['stage', 'behaviours', 'minNodes']),
  );
  const maxNodes = maxNodesWithDefault(
    get(props, ['stage', 'behaviours', 'maxNodes']),
  );

  const [showMinWarning, setShowMinWarning] = useState(false);

  const handleBeforeLeaving = useCallback(
    (direction, destination) => {
      const isLeavingStage =
        (isFirstPrompt() && direction === -1) ||
        (isLastPrompt() && direction === 1);

      // Implementation quirk that destination is only provided when navigation
      // is triggered by Stages Menu. Use this to skip message if user has
      // navigated directly using stages menu.
      if (
        isUndefined(destination) &&
        isLeavingStage &&
        stageNodeCount < minNodes
      ) {
        setShowMinWarning(true);
        return;
      }

      onComplete();
    },
    [stageNodeCount, minNodes, onComplete, isFirstPrompt, isLastPrompt],
  );

  registerBeforeNext(handleBeforeLeaving);

  useEffect(() => {
    setShowMinWarning(false);
  }, []);

  const searchOptions = ((options) => {
    if (!options || isEmpty(options)) {
      return options;
    }

    return {
      ...options,
      matchProperties: convertNamesToUUIDs(
        nodeVariables,
        get(stage, 'searchOptions.matchProperties'),
      ),
    };
  })(stage.searchOptions);

  const fallbackKeys = useMemo(
    () =>
      Object.keys(get(items, [0, 'data', entityAttributesProperty], {})).map(
        (attribute) => ['data', entityAttributesProperty, attribute],
      ),
    [items],
  );

  const fuseOptions = useFuseOptions(searchOptions, {
    keys: fallbackKeys,
    threshold: 0.6,
  });

  const { isOver, willAccept } = useDropMonitor('node-list') || {
    isOver: false,
    willAccept: false,
  };

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

  const nodeListClasses = cx('name-generator-roster-interface__node-list', {
    'name-generator-roster-interface__node-list--empty':
      nodesForPrompt.length === 0,
  });

  const disabled = useMemo(
    () => stageNodeCount >= maxNodes,
    [stageNodeCount, maxNodes],
  );

  return (
    <div className="name-generator-roster-interface" ref={interfaceRef}>
      <AnimatePresence exitBeforeEnter>
        {itemsStatus.isLoading ? (
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
        ) : (
          <>
            <motion.div
              className="name-generator-roster-interface__prompt"
              key="prompts"
            >
              <Prompts prompts={prompts} currentPrompt={prompt.id} />
            </motion.div>
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
                  key={disabled}
                  id="searchable-list"
                  items={items}
                  title="Available to add"
                  columns={countColumns}
                  placeholder={
                    itemsStatus.error && (
                      <ErrorMessage error={itemsStatus.error} />
                    )
                  }
                  itemType="SOURCE_NODES" // drop type
                  excludeItems={excludeItems}
                  itemComponent={DataCard}
                  dragComponent={Node}
                  sortOptions={sortOptions}
                  searchOptions={fuseOptions}
                  accepts={({ meta: { itemType } }) =>
                    itemType !== 'SOURCE_NODES'
                  }
                  onDrop={handleRemoveNode}
                  dropNodeColor={dropNodeColor}
                  disabled={disabled}
                />
              </div>
              <div className="name-generator-roster-interface__node-panel">
                <Panel title="Added" noHighlight noCollapse>
                  <div className="name-generator-roster-interface__node-list">
                    <List
                      id="node-list"
                      className={nodeListClasses}
                      itemType="ADDED_NODES"
                      accepts={({ meta: { itemType } }) =>
                        itemType !== 'ADDED_NODES'
                      }
                      onDrop={handleAddNode}
                      items={nodesForPrompt.map((item) => ({
                        id: item._uid,
                        data: item,
                        props: item,
                      }))}
                      itemComponent={Node}
                    />
                    <AnimatePresence>
                      {willAccept && (
                        <DropOverlay
                          isOver={isOver}
                          nodeColor={dropNodeColor}
                          message="Drop here to add"
                        />
                      )}
                    </AnimatePresence>
                  </div>
                </Panel>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      {interfaceRef.current && (
        <MinNodesNotMet
          show={showMinWarning}
          minNodes={minNodes}
          onHideCallback={() => setShowMinWarning(false)}
        />
      )}
      {interfaceRef.current && (
        <MaxNodesMet show={stageNodeCount >= maxNodes} timeoutDuration={0} />
      )}
    </div>
  );
};

NameGeneratorRoster.propTypes = {
  prompt: PropTypes.object.isRequired,
  stage: PropTypes.object.isRequired,
};

NameGeneratorRoster.defaultProps = {};

export default compose(withPrompt)(NameGeneratorRoster);

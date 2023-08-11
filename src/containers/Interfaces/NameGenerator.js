import React, { useEffect, useRef, useState } from 'react';
import { compose } from 'redux';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import {
  has, isUndefined, omit,
} from 'lodash';
import { createPortal } from 'react-dom';
import { entityAttributesProperty, entityPrimaryKeyProperty } from '@codaco/shared-consts';
import Prompts from '../../components/Prompts';
import withPrompt from '../../behaviours/withPrompt';
import { actionCreators as sessionsActions } from '../../ducks/modules/sessions';
import { makeNetworkNodesForPrompt, makeGetAdditionalAttributes, makeGetStageNodeCount } from '../../selectors/interface';
import { makeGetPromptNodeModelData, makeGetNodeIconName } from '../../selectors/name-generator';
import NodePanels from '../NodePanels';
import NodeForm from '../NodeForm';
import { NodeList, NodeBin } from '../../components';
import {
  MaxNodesMet, maxNodesWithDefault, MinNodesNotMet, minNodesWithDefault,
} from './utils/StageLevelValidation';
import { get } from '../../utils/lodash-replacements';
import QuickNodeForm from '../QuickNodeForm';
import { getNodeColor, getNodeTypeLabel } from '../../selectors/network';

const NameGenerator = (props) => {
  const {
    registerBeforeNext,
    prompt,
    stage,
  } = props;

  const {
    prompts,
    form,
    quickAdd,
    behaviours,
    subject,
  } = stage;

  const interfaceRef = useRef(null);

  const [selectedNode, setSelectedNode] = useState(null);
  const [showMinWarning, setShowMinWarning] = useState(false);

  const minNodes = minNodesWithDefault(behaviours?.minNodes);
  const maxNodes = maxNodesWithDefault(behaviours?.maxNodes);

  const stageNodeCount = useSelector((state) => makeGetStageNodeCount()(state, props));
  const newNodeAttributes = useSelector((state) => makeGetAdditionalAttributes()(state, props));
  const newNodeModelData = useSelector((state) => makeGetPromptNodeModelData()(state, props));
  const nodesForPrompt = useSelector((state) => makeNetworkNodesForPrompt()(state, props));
  const nodeIconName = useSelector((state) => makeGetNodeIconName()(state, props));
  const nodeType = useSelector(getNodeTypeLabel(subject?.type));
  const nodeColor = useSelector(getNodeColor(subject?.type));

  const dispatch = useDispatch();

  const addNode = (...properties) => dispatch(sessionsActions.addNode(...properties));
  const addNodeToPrompt = (...properties) => dispatch(
    sessionsActions.addNodeToPrompt(...properties),
  );
  const removeNode = (uid) => {
    dispatch(sessionsActions.removeNode(uid));
  };

  const maxNodesReached = stageNodeCount >= maxNodes;

  useEffect(() => {
    if (stageNodeCount >= minNodes) {
      setShowMinWarning(false);
    }
  }, [stageNodeCount]);

  // Prevent leaving the stage if the minimum number of nodes has not been met
  const handleBeforeLeaving = (direction, destination) => {
    const {
      isFirstPrompt,
      isLastPrompt,
      onComplete,
    } = props;

    const isLeavingStage = (isFirstPrompt() && direction === -1)
      || (isLastPrompt() && direction === 1);

    // Implementation quirk that destination is only provided when navigation
    // is triggered by Stages Menu. Use this to skip message if user has
    // navigated directly using stages menu.
    if (isUndefined(destination) && isLeavingStage && stageNodeCount < minNodes) {
      setShowMinWarning(true);
      return;
    }

    onComplete();
  };

  if (registerBeforeNext) {
    registerBeforeNext(handleBeforeLeaving);
  }

  /**
   * Drop node handler
   * Adds prompt attributes to existing nodes, or adds new nodes to the network.
   * @param {object} item - key/value object containing node object from the network store
   */
  const handleDropNode = (item) => {
    const node = { ...item.meta };
    // Test if we are updating an existing network node, or adding it to the network
    if (has(node, 'promptIDs')) {
      addNodeToPrompt(
        node[entityPrimaryKeyProperty],
        prompt.id,
        { ...newNodeAttributes },
      );
    } else {
      const droppedAttributeData = node[entityAttributesProperty];
      const droppedModelData = omit(node, entityAttributesProperty);

      addNode(
        { ...newNodeModelData, ...droppedModelData },
        { ...droppedAttributeData, ...newNodeAttributes },
      );
    }
  };

  // When a node is tapped, trigger editing.
  const handleSelectNode = (node) => {
    if (!form) {
      return;
    }
    setSelectedNode(node);
  };

  return (
    <div className="name-generator-interface" ref={interfaceRef}>
      <div className="name-generator-interface__prompt">
        <Prompts
          prompts={prompts}
          currentPrompt={prompt.id}
        />
      </div>
      <div className="name-generator-interface__main">
        <div className="name-generator-interface__panels">
          <NodePanels stage={stage} prompt={prompt} disableAddNew={maxNodesReached} />
        </div>
        <div className="name-generator-interface__nodes">
          <NodeList
            items={nodesForPrompt}
            stage={stage}
            listId={`${stage.id}_${prompt.id}_MAIN_NODE_LIST`}
            id="MAIN_NODE_LIST"
            accepts={({ meta }) => get(meta, 'itemType', null) === 'NEW_NODE'}
            itemType="EXISTING_NODE"
            onDrop={handleDropNode}
            onItemClick={handleSelectNode}
          />
        </div>
      </div>
      {interfaceRef.current && createPortal(
        <MaxNodesMet show={maxNodesReached} timeoutDuration={0} />,
        interfaceRef.current,
      )}
      {interfaceRef.current && createPortal(<MinNodesNotMet
        show={showMinWarning}
        minNodes={minNodes}
        onHideCallback={() => setShowMinWarning(false)}
      />, interfaceRef.current)}

      {form && interfaceRef.current
        && createPortal(
          <NodeForm
            subject={subject}
            selectedNode={selectedNode}
            form={form}
            disabled={maxNodesReached}
            icon={nodeIconName}
            nodeType={nodeType}
            newNodeModelData={newNodeModelData}
            newNodeAttributes={newNodeAttributes}
            onClose={() => setSelectedNode(null)}
          />, interfaceRef.current,
        )}
      {!form && interfaceRef.current && createPortal(
        <QuickNodeForm
          disabled={maxNodesReached}
          icon={nodeIconName}
          nodeColor={nodeColor}
          nodeType={nodeType}
          newNodeModelData={newNodeModelData}
          newNodeAttributes={newNodeAttributes}
          targetVariable={quickAdd}
          onShowForm={() => setShowMinWarning(false)}
        />, interfaceRef.current,
      )}
      <NodeBin
        accepts={(meta) => meta.itemType === 'EXISTING_NODE'}
        dropHandler={(meta) => removeNode(meta[entityPrimaryKeyProperty])}
        id="NODE_BIN"
      />
    </div>
  );
};

NameGenerator.defaultProps = {
};

NameGenerator.propTypes = {
  prompt: PropTypes.object.isRequired,
  stage: PropTypes.object.isRequired,
};

export default compose(
  withPrompt,
)(NameGenerator);

export {
  NameGenerator as UnconnectedNameGenerator,
};

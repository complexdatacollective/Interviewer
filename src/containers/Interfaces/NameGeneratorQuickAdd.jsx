
import React, { Component, useEffect, useState } from 'react';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { AnimatePresence, motion } from 'framer-motion';
import { Icon } from '@codaco/ui';
import { entityAttributesProperty, entityPrimaryKeyProperty } from '@codaco/shared-consts';
import {
  has, omit, debounce, defaultTo, isUndefined,
} from 'lodash';
import Prompts from '../../components/Prompts';
import withPrompt from '../../behaviours/withPrompt';
import { actionCreators as sessionsActions } from '../../ducks/modules/sessions';
import { makeNetworkNodesForPrompt, makeGetAdditionalAttributes, makeGetStageNodeCount } from '../../selectors/interface';
import { makeGetPromptNodeModelData, makeGetNodeIconName } from '../../selectors/name-generator';
import NodePanels from '../NodePanels';
import QuickNodeForm from '../QuickNodeForm';
import { NodeList, NodeBin } from '../../components';
import { get } from '../../utils/lodash-replacements';

export const useSelfDismissingNote = (
  {
    show,
    dontHide = false,
    onHideCallback = () => { },
  },
) => {
  const [visible, setVisible] = useState(show);
  useEffect(() => {
    let timeout;
    if (show) {
      setVisible(true);

      if (!dontHide) {
        timeout = setTimeout(() => {
          onHideCallback();
          setVisible(false);
        }, 4000);
      }
    }

    if (!show) {
      setVisible(false);
      clearTimeout(timeout);
    }

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [show, dontHide, onHideCallback]);

  return {
    visible,
  }
};

export const MaxNodesReached = () => {
  const { visible } = useSelfDismissingNote({
    show: true,
  });

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="alter-limit-nudge"
          style={{
            bottom: '2.4rem',
            width: '40rem',
            alignItems: 'center',
            left: 'calc(50% - 20rem)',
            animation: 'shake 1.32s cubic-bezier(.36, .07, .19, .97) both',
            animationDelay: '1s',
          }}
          initial={{ opacity: 0, y: '100%' }}
          animate={{ opacity: 1, y: 0, transition: { delay: 1, type: 'spring' } }}
          exit={{ opacity: 0, y: '100%' }}
        >
          <div
            style={{
              flex: '0 0 1.8rem',
            }}
          >
            <Icon name="info" style={{ height: '3rem', width: '3rem' }} />
          </div>
          <div
            style={{
              flex: '1 1 auto',
              margin: '0 1.8rem',
            }}
          >
            <p>
              You have added the maximum number of items. Click
              the down arrow to continue.
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const MinNodesNotMet = ({ minNodes }) => {
  const { visible } = useSelfDismissingNote({
    show: true,
  });

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="alter-limit-nudge"
          style={{
            bottom: '2.4rem',
            width: '30rem',
            alignItems: 'center',
            left: 'calc(50% - 15rem)',
            animation: 'shake 1.32s cubic-bezier(.36, .07, .19, .97) both',
          }}
          initial={{ opacity: 0, y: '100%' }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: '100%' }}
        >
          <div
            style={{
              flex: '0 0 1.8rem',
            }}
          >
            <Icon name="error" style={{ height: '3rem', width: '3rem' }} />
          </div>
          <div
            style={{
              flex: '1 1 auto',
              margin: '0 1.8rem',
            }}
          >
            <p>
              You must create at least
              {' '}
              <strong>
                {minNodes}
              </strong>
              {' '}
              {minNodes > 1 ? 'items' : 'item'}
              {' '}
              before you can continue.
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const minNodesWithDefault = (stageValue) => defaultTo(stageValue, 0);
export const maxNodesWithDefault = (stageValue) => defaultTo(stageValue, Infinity);

/**
  * Name Generator Interface
  * @extends Component
  */
class NameGenerator extends Component {
  constructor(props) {
    super(props);

    const {
      registerBeforeNext,
    } = this.props;

    registerBeforeNext(this.handleBeforeLeaving);

    this.state = {
      selectedNode: null,
      showMinWarning: false,
    };
  }

  // eslint-disable-next-line camelcase
  UNSAFE_componentWillReceiveProps() {
    this.setState({ showMinWarning: false });
  }

  /**
   * Node Form submit handler
   */
  handleSubmitForm = debounce(({ form }) => {
    const { selectedNode } = this.state;
    const {
      addNode,
      newNodeModelData,
      newNodeAttributes,
      updateNode,
    } = this.props;

    if (form) {
      if (!selectedNode) {
        /**
         *  addNode(modelData, attributeData);
        */
        addNode(
          newNodeModelData,
          { ...newNodeAttributes, ...form },
        );
      } else {
        /**
         * updateNode(nodeId, newModelData, newAttributeData)
         */
        const selectedUID = selectedNode[entityPrimaryKeyProperty];
        updateNode(selectedUID, {}, form);
      }
    }

    this.setState({ selectedNode: null });
  }, 1000, { // This is needed to prevent double submit.
    leading: true,
    trailing: false,
  });

  /**
   * Drop node handler
   * Adds prompt attributes to existing nodes, or adds new nodes to the network.
   * @param {object} item - key/value object containing node object from the network store
   */
  handleDropNode = (item) => {
    const {
      updateNode,
      newNodeModelData,
      newNodeAttributes,
      addNode,
    } = this.props;

    const node = { ...item.meta };

    // Test if we are updating an existing network node, or adding it to the network
    if (has(node, 'promptIDs')) {
      updateNode(
        node[entityPrimaryKeyProperty],
        { ...newNodeModelData },
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
  }

  handleBeforeLeaving = (direction, destination) => {
    const {
      isFirstPrompt,
      isLastPrompt,
      minNodes,
      stageNodeCount,
      onComplete,
    } = this.props;

    const isLeavingStage = (isFirstPrompt() && direction === -1)
      || (isLastPrompt() && direction === 1);
    // Implementation quirk that destination is only provided when navigation
    // is triggered by Stages Menu. Use this to skip message if user has
    // navigated directly using stages menu.
    if (isUndefined(destination) && isLeavingStage && stageNodeCount < minNodes) {
      this.setState({ showMinWarning: true });
      return;
    }

    onComplete();
  }

  render() {
    const {
      nodesForPrompt,
      newNodeAttributes,
      newNodeModelData,
      nodeIconName,
      prompt,
      stage,
      addNode,
      removeNode,
      maxNodes,
      minNodes,
      stageNodeCount,
    } = this.props;

    const {
      prompts,
      quickAdd,
    } = stage;

    const {
      showMinWarning,
    } = this.state;

    return (
      <div className="name-generator-interface">
        <div className="name-generator-interface__prompt">
          <Prompts
            prompts={prompts}
            currentPrompt={prompt.id}
          />
        </div>
        <div className="name-generator-interface__main">
          <div className="name-generator-interface__panels">
            <NodePanels
              stage={stage}
              prompt={prompt}
              disableAddNew={stageNodeCount >= maxNodes}
            />
          </div>
          <div className="name-generator-interface__nodes">
            <NodeList
              items={nodesForPrompt}
              stage={stage}
              listId={`${stage.id}_${prompt.id}_MAIN_NODE_LIST`}
              id="MAIN_NODE_LIST"
              accepts={({ meta }) => get(meta, 'itemType', null) === 'NEW_NODE'}
              itemType="EXISTING_NODE"
              onDrop={this.handleDropNode}
              onItemClick={this.handleSelectNode}
            />
          </div>
        </div>
        <MaxNodesReached show={stageNodeCount >= maxNodes} dontHide />
        <MinNodesNotMet show={showMinWarning} minNodes={minNodes} />
        <QuickNodeForm
          onClick={() => this.setState({ showMinWarning: false })}
          disabled={stageNodeCount >= maxNodes}
          stage={stage}
          targetVariable={quickAdd}
          addNode={addNode}
          nodeIconName={nodeIconName}
          newNodeAttributes={newNodeAttributes}
          newNodeModelData={newNodeModelData}
        />
        <NodeBin
          accepts={(meta) => meta.itemType === 'EXISTING_NODE'}
          dropHandler={(meta) => removeNode(meta[entityPrimaryKeyProperty])}
          id="NODE_BIN"
        />
      </div>
    );
  }
}

NameGenerator.defaultProps = {
  quickAdd: null,
};

NameGenerator.propTypes = {
  addNode: PropTypes.func.isRequired,
  quickAdd: PropTypes.string,
  newNodeAttributes: PropTypes.object.isRequired,
  newNodeModelData: PropTypes.object.isRequired,
  nodesForPrompt: PropTypes.array.isRequired,
  nodeIconName: PropTypes.string.isRequired,
  prompt: PropTypes.object.isRequired,
  stage: PropTypes.object.isRequired,
  updateNode: PropTypes.func.isRequired,
  removeNode: PropTypes.func.isRequired,
};

function makeMapStateToProps() {
  const networkNodesForPrompt = makeNetworkNodesForPrompt();
  const getPromptNodeAttributes = makeGetAdditionalAttributes();
  const getPromptNodeModelData = makeGetPromptNodeModelData();
  const getNodeIconName = makeGetNodeIconName();
  const getStageNodeCount = makeGetStageNodeCount();

  return function mapStateToProps(state, props) {
    return {
      activePromptAttributes: props.prompt.additionalAttributes,
      minNodes: minNodesWithDefault(get(props, ['stage', 'behaviours', 'minNodes'])),
      maxNodes: maxNodesWithDefault(get(props, ['stage', 'behaviours', 'maxNodes'])),
      stageNodeCount: getStageNodeCount(state, props),
      newNodeAttributes: getPromptNodeAttributes(state, props),
      newNodeModelData: getPromptNodeModelData(state, props),
      nodesForPrompt: networkNodesForPrompt(state, props),
      nodeIconName: getNodeIconName(state, props),
    };
  };
}

function mapDispatchToProps(dispatch) {
  return {
    addNode: bindActionCreators(sessionsActions.addNode, dispatch),
    updateNode: bindActionCreators(sessionsActions.updateNode, dispatch),
    removeNode: bindActionCreators(sessionsActions.removeNode, dispatch),
  };
}

export default compose(
  withPrompt,
  connect(makeMapStateToProps, mapDispatchToProps),
)(NameGenerator);

export {
  NameGenerator as UnconnectedNameGenerator,
};

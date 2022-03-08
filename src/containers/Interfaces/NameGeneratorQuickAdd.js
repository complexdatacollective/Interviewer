/* eslint-disable @codaco/spellcheck/spell-checker */
import React, { Component } from 'react';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { AnimatePresence, motion } from 'framer-motion';
import { Icon } from '@codaco/ui';
import {
  get, has, omit, debounce,
} from 'lodash';
import Prompts from '../../components/Prompts';
import withPrompt from '../../behaviours/withPrompt';
import { actionCreators as sessionsActions } from '../../ducks/modules/sessions';
import { makeNetworkNodesForPrompt, makeGetAdditionalAttributes, makeGetStageNodeCount } from '../../selectors/interface';
import { makeGetPromptNodeModelData, makeGetNodeIconName } from '../../selectors/name-generator';
import NodePanels from '../NodePanels';
import QuickNodeForm from '../QuickNodeForm';
import { NodeList, NodeBin } from '../../components';
import { entityAttributesProperty, entityPrimaryKeyProperty } from '../../ducks/modules/network';

export const MaxNodesReached = ({ show }) => (
  <AnimatePresence>
    { show && (
      <motion.div
        className="scroll-nudge"
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
            flex: '0 0 1rem',
          }}
        >
          <Icon name="info" style={{ height: '3rem', width: '3rem' }} />
        </div>
        <div
          style={{
            flex: '1 1 auto',
            marginLeft: '1.2rem',
          }}
        >
          <p>
            You have added the maximum number of nodes for this stage. Click
            the down arrow to continue.
          </p>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

export const MinNodesNotMet = ({ show, minNodes }) => (
  <AnimatePresence>
    { show && (
      <motion.div
        className="scroll-nudge"
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
            flex: '0 0 1rem',
          }}
        >
          <Icon name="error" style={{ height: '3rem', width: '3rem' }} />
        </div>
        <div
          style={{
            flex: '1 1 auto',
            marginLeft: '1.2rem',
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

  handleBeforeLeaving = (direction) => {
    const {
      isFirstPrompt,
      isLastPrompt,
      minNodes,
      stageNodeCount,
      onComplete,
    } = this.props;

    const leaving = (isFirstPrompt() && direction === -1) || (isLastPrompt() && direction === 1);
    if (leaving && stageNodeCount < minNodes) {
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
              disableAddNew={stageNodeCount === maxNodes}
            />
          </div>
          <div className="name-generator-interface__nodes">
            <NodeList
              items={nodesForPrompt}
              listId={`${stage.id}_${prompt.id}_MAIN_NODE_LIST`}
              id="MAIN_NODE_LIST"
              accepts={({ meta }) => get(meta, 'itemType', null) === 'NEW_NODE'}
              itemType="EXISTING_NODE"
              onDrop={this.handleDropNode}
              onItemClick={this.handleSelectNode}
            />
          </div>
        </div>
        <MaxNodesReached show={stageNodeCount === maxNodes} />
        <MinNodesNotMet show={showMinWarning} minNodes={minNodes} />
        <QuickNodeForm
          onClick={() => this.setState({ showMinWarning: false })}
          disabled={stageNodeCount === maxNodes}
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
      minNodes: get(props, ['stage', 'behaviours', 'minNodes'], 0),
      maxNodes: get(props, ['stage', 'behaviours', 'maxNodes'], null),
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

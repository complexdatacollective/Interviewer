import React, { Component } from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { get, has, omit } from 'lodash';
import { Icon } from '@codaco/ui';
import Prompts from '../../components/Prompts';
import withPrompt from '../../behaviours/withPrompt';
import { actionCreators as sessionsActions } from '../../ducks/modules/sessions';
import { makeNetworkNodesForPrompt, makeGetAdditionalAttributes, makeGetStageNodeCount } from '../../selectors/interface';
import { makeGetPromptNodeModelData, makeGetNodeIconName } from '../../selectors/name-generator';
import NodePanels from '../NodePanels';
import NodeForm from '../NodeForm';
import { NodeList, NodeBin } from '../../components';
import { entityAttributesProperty, entityPrimaryKeyProperty } from '../../ducks/modules/network';
import { MaxNodesReached, MinNodesNotMet } from './NameGeneratorQuickAdd';

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
      showNodeForm: false,
      showMinWarning: false,
    };
  }

  // eslint-disable-next-line camelcase
  UNSAFE_componentWillReceiveProps() {
    this.setState({ showMinWarning: false });
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

  /**
   * Drop node handler
   * Adds prompt attributes to existing nodes, or adds new nodes to the network.
   * @param {object} item - key/value object containing node object from the network store
   */
  handleDropNode = (item) => {
    const {
      updateNode,
      addNode,
      newNodeModelData,
      newNodeAttributes,
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

  /**
  * Node Form submit handler
  */
  handleSubmitForm = ({ form }) => {
    const { selectedNode } = this.state;
    const {
      addNode,
      updateNode,
      newNodeModelData,
      newNodeAttributes,
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

    this.setState({ showNodeForm: false, selectedNode: null });
  }

  /**
   * Click node handler
   * Triggers the edit node form.
   * @param {object} node - key/value object containing node object from the network store
   */
  handleSelectNode = (node) => {
    this.setState({
      selectedNode: node,
      showNodeForm: true,
    });
  }

  handleClickAddNode = () => {
    const { showNodeForm } = this.state;
    this.setState({
      selectedNode: null,
      showNodeForm: !showNodeForm,
    });
  }

  handleCloseForm = () => {
    this.setState({
      selectedNode: null,
      showNodeForm: false,
    });
  }

  render() {
    const {
      nodesForPrompt,
      nodeIconName,
      prompt,
      stage,
      removeNode,
      stageNodeCount,
      maxNodes,
      minNodes,
    } = this.props;

    const {
      prompts,
      form,
    } = stage;

    const {
      selectedNode,
      showNodeForm,
      showMinWarning,
    } = this.state;

    console.log('stage', stageNodeCount, stageNodeCount >= maxNodes);

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
            <NodePanels stage={stage} prompt={prompt} disableAddNew={stageNodeCount >= maxNodes} />
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
        <MaxNodesReached show={stageNodeCount >= maxNodes} />
        <MinNodesNotMet show={showMinWarning} minNodes={minNodes} />
        { form
          && (
          <div
            onClick={this.handleClickAddNode}
            className={`name-generator-interface__add-node ${stageNodeCount >= maxNodes ? 'name-generator-interface__add-node--disabled' : ''}`}
            data-clickable="open-add-node"
          >
            <Icon name={nodeIconName} />
          </div>
          )}

        { form
          && (
          <NodeForm
            key={selectedNode}
            node={selectedNode}
            stage={stage}
            onSubmit={this.handleSubmitForm}
            onClose={this.handleCloseForm}
            show={showNodeForm}
          />
          )}
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
  form: null,
};

NameGenerator.propTypes = {
  addNode: PropTypes.func.isRequired,
  form: PropTypes.object,
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
      activePromptAttributes: get(props, ['prompt', 'additionalAttributes'], {}),
      minNodes: get(props, ['stage', 'behaviours', 'minNodes'], 0),
      maxNodes: get(props, ['stage', 'behaviours', 'maxNodes'], 2),
      stageNodeCount: getStageNodeCount(state, props),
      newNodeAttributes: getPromptNodeAttributes(state, props),
      newNodeModelData: getPromptNodeModelData(state, props),
      nodesForPrompt: networkNodesForPrompt(state, props),
      nodeIconName: getNodeIconName(state, props),
    };
  };
}

const mapDispatchToProps = {
  addNode: sessionsActions.addNode,
  updateNode: sessionsActions.updateNode,
  removeNode: sessionsActions.removeNode,
};

export default compose(
  withPrompt,
  connect(makeMapStateToProps, mapDispatchToProps),
)(NameGenerator);

export {
  NameGenerator as UnconnectedNameGenerator,
};

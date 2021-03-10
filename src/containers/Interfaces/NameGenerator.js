import React, { Component } from 'react';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { get, has, omit } from 'lodash';
import { Icon } from '@codaco/ui';
import withPrompt from '../../behaviours/withPrompt';
import { actionCreators as sessionsActions } from '../../ducks/modules/sessions';
import { makeNetworkNodesForPrompt, makeGetAdditionalAttributes } from '../../selectors/interface';
import { makeGetPromptNodeModelData, makeGetNodeIconName } from '../../selectors/name-generator';
import PromptSwiper from '../PromptSwiper';
import NodePanels from '../NodePanels';
import NodeForm from '../NodeForm';
import { NodeList, NodeBin } from '../../components';
import { entityAttributesProperty, entityPrimaryKeyProperty } from '../../ducks/modules/network';

/**
  * Name Generator Interface
  * @extends Component
  */
class NameGenerator extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedNode: null,
      showNodeForm: false,
    };
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
      promptBackward,
      promptForward,
      stage,
      removeNode,
    } = this.props;

    const {
      prompts,
      form,
    } = stage;

    const {
      selectedNode,
      showNodeForm,
    } = this.state;

    return (
      <div className="name-generator-interface">
        <div className="name-generator-interface__prompt">
          <PromptSwiper
            forward={promptForward}
            backward={promptBackward}
            prompt={prompt}
            prompts={prompts}
          />
        </div>
        <div className="name-generator-interface__main">
          <div className="name-generator-interface__panels">
            <NodePanels stage={stage} prompt={prompt} />
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

        { form
          && (
          <div
            onClick={this.handleClickAddNode}
            className="name-generator-interface__add-node"
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
  promptBackward: PropTypes.func.isRequired,
  promptForward: PropTypes.func.isRequired,
  stage: PropTypes.object.isRequired,
  updateNode: PropTypes.func.isRequired,
  removeNode: PropTypes.func.isRequired,
};

function makeMapStateToProps() {
  const networkNodesForPrompt = makeNetworkNodesForPrompt();
  const getPromptNodeAttributes = makeGetAdditionalAttributes();
  const getPromptNodeModelData = makeGetPromptNodeModelData();
  const getNodeIconName = makeGetNodeIconName();

  return function mapStateToProps(state, props) {
    return {
      activePromptAttributes: props.prompt.additionalAttributes,
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

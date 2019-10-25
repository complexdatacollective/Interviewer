import React, { Component } from 'react';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { get, has, omit } from 'lodash';
import withPrompt from '../../behaviours/withPrompt';
import { actionCreators as sessionsActions } from '../../ducks/modules/sessions';
import { makeNetworkNodesForPrompt, makeGetAdditionalAttributes } from '../../selectors/interface';
import { makeGetPromptNodeModelData, makeGetNodeIconName } from '../../selectors/name-generator';
import { PromptSwiper, NodePanels, NodeForm } from '../';
import { NodeList, NodeBin } from '../../components/';
import { Icon } from '../../ui/components';
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
    const node = { ...item.meta };
    // Test if we are updating an existing network node, or adding it to the network
    if (has(node, 'promptIDs')) {
      this.props.updateNode(
        node[entityPrimaryKeyProperty],
        { ...this.props.newNodeModelData },
        { ...this.props.newNodeAttributes },
      );
    } else {
      const droppedAttributeData = node[entityAttributesProperty];
      const droppedModelData = omit(node, entityAttributesProperty);

      this.props.addNode(
        { ...this.props.newNodeModelData, ...droppedModelData },
        { ...droppedAttributeData, ...this.props.newNodeAttributes },
      );
    }
  }

  /**
  * Node Form submit handler
  */
  handleSubmitForm = ({ form }) => {
    if (form) {
      if (!this.state.selectedNode) {
        /**
        *  addNode(modelData, attributeData);
        */
        this.props.addNode(
          this.props.newNodeModelData,
          { ...this.props.newNodeAttributes, ...form },
        );
      } else {
        /**
        * updateNode(nodeId, newModelData, newAttributeData)
        */
        const selectedUID = this.state.selectedNode[entityPrimaryKeyProperty];
        this.props.updateNode(selectedUID, {}, form);
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
    this.setState({
      selectedNode: null,
      showNodeForm: !this.state.showNodeForm,
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
    } = this.props;

    const {
      prompts,
      form,
    } = this.props.stage;

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
              id={'MAIN_NODE_LIST'}
              accepts={({ meta }) => get(meta, 'itemType', null) === 'NEW_NODE'}
              itemType="EXISTING_NODE"
              onDrop={this.handleDropNode}
              onItemClick={this.handleSelectNode}
            />
          </div>
        </div>

        { form &&
          <div
            onClick={this.handleClickAddNode}
            className="name-generator-interface__add-node"
            data-clickable="open-add-node"
          >
            <Icon name={nodeIconName} />
          </div>
        }

        { form &&
          <NodeForm
            key={this.state.selectedNode}
            node={this.state.selectedNode}
            stage={this.props.stage}
            onSubmit={this.handleSubmitForm}
            onClose={this.handleCloseForm}
            show={this.state.showNodeForm}
          />
        }
        <NodeBin
          accepts={meta => meta.itemType === 'EXISTING_NODE'}
          dropHandler={meta => this.props.removeNode(meta[entityPrimaryKeyProperty])}
          id="NODE_BIN"
        />
      </div>
    );
  }
}

NameGenerator.defaultProps = {
  activePromptAttributes: {},
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

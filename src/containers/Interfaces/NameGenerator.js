import React, { Component } from 'react';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { get, has, omit } from 'lodash';
import withPrompt from '../../behaviours/withPrompt';
import { actionCreators as sessionsActions } from '../../ducks/modules/sessions';
import { makeNetworkNodesForPrompt, makeGetAdditionalAttributes } from '../../selectors/interface';
import { makeGetPromptNodeModelData, makeGetNodeIconName } from '../../selectors/name-generator';
import { PromptSwiper, NodePanels, NodeForm, QuickNodeForm } from '../';
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
   * Click node handler
   * Triggers the edit node form if using forms, and does nothing if using quick form.
   * @param {object} node - key/value object containing node object from the network store
   */
  handleSelectNode = (node) => {
    if (!this.props.stage.quickAdd) {
      this.setState({
        selectedNode: node,
        showNodeForm: true,
      });
    }
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
      newNodeAttributes,
      newNodeModelData,
      nodeIconName,
      prompt,
      promptBackward,
      promptForward,
      stage,
    } = this.props;

    const {
      prompts,
      form,
      quickAdd,
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
              id={`${stage.id}_${prompt.id}_MAIN_NODE_LIST`}
              accepts={({ meta }) => get(meta, 'itemType', null) === 'NEW_NODE'}
              itemType="EXISTING_NODE"
              onDrop={this.handleDropNode}
              onItemClick={this.handleSelectNode}
            />
          </div>
        </div>

        { (form && !quickAdd) &&
          <Icon
            name={nodeIconName}
            onClick={this.handleClickAddNode}
            className="name-generator-interface__add-node"
          />
        }

        { (form && !quickAdd) &&
          <NodeForm
            node={this.state.selectedNode}
            stage={this.props.stage}
            onSubmit={this.handleSubmitForm}
            onClose={this.handleCloseForm}
            show={this.state.showNodeForm}
          />
        }

        { quickAdd &&
          <QuickNodeForm
            stage={this.props.stage}
            addNode={this.props.addNode}
            nodeIconName={nodeIconName}
            newNodeAttributes={newNodeAttributes}
            newNodeModelData={newNodeModelData}
          />
        }
        <NodeBin
          accepts={(meta) => {
            console.log('accepts', meta);
            return meta.itemType === 'EXISTING_NODE';
          }}
          dropHandler={(meta) => {
            console.log('drop handler', meta);
            this.props.removeNode(meta[entityPrimaryKeyProperty]);
          }}
          id="NODE_BIN"
        />
      </div>
    );
  }
}

NameGenerator.defaultProps = {
  activePromptAttributes: {},
  form: null,
  quickAdd: false,
};

NameGenerator.propTypes = {
  addNode: PropTypes.func.isRequired,
  form: PropTypes.object,
  quickAdd: PropTypes.bool,
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

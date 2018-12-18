import React, { Component } from 'react';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { get, has } from 'lodash';
import withPrompt from '../../behaviours/withPrompt';
import { actionCreators as sessionsActions } from '../../ducks/modules/sessions';
import { makeNetworkNodesForPrompt } from '../../selectors/interface';
import { makeGetPromptNodeAttributes, makeGetNodeIconName } from '../../selectors/name-generator';
import { PromptSwiper, NodePanels, NodeForm } from '../';
import { NodeList, NodeBin } from '../../components/';
import { Icon } from '../../ui/components';

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
  handleSubmitForm = ({ form, addAnotherNode } = { addAnotherNode: false }) => {
    if (form) {
      if (!this.state.selectedNode) {
        this.props.addNodes({ attributes: { ...form } }, this.props.newNodeAttributes);
      } else {
        this.props.updateNode({ ...this.state.selectedNode }, form);
      }
    }

    this.setState({ showNodeForm: addAnotherNode, selectedNode: null });
  }

  /**
   * Drop node handler
   * Adds prompt attributes to existing nodes, or adds new nodes to the network.
   * @param {object} node - key/value object containing node object from the network store
   */
  handleDropNode = (item) => {
    const node = { ...item.meta };
    // Test if we are updating an existing network node, or adding it to the network
    if (has(node, 'promptId') || has(node, 'stageId')) {
      this.props.updateNode(node, { ...this.props.activePromptAttributes });
    } else {
      this.props.addNodes(node, this.props.newNodeAttributes);
    }
  }

  /**
   * Click node handler
   * Triggers the edit node form
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
      showNodeForm: true,
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
              nodes={nodesForPrompt}
              listId={`${stage.id}_${prompt.id}_MAIN_NODE_LIST`}
              id={'MAIN_NODE_LIST'}
              accepts={({ meta }) => get(meta, 'itemType', null) === 'NEW_NODE'}
              itemType="EXISTING_NODE"
              onDrop={this.handleDropNode}
              onSelect={this.handleSelectNode}
            />
          </div>
        </div>

        { form &&
          <Icon
            name={nodeIconName}
            onClick={this.handleClickAddNode}
            className="name-generator-interface__add-node"
          />
        }
        { form &&
          <NodeForm
            node={this.state.selectedNode}
            stage={this.props.stage}
            onSubmit={this.handleSubmitForm}
            onClose={this.handleCloseForm}
            show={this.state.showNodeForm}
          />
        }

        <div className="name-generator-interface__node-bin">
          <NodeBin id="NODE_BIN" />
        </div>
      </div>
    );
  }
}

NameGenerator.defaultProps = {
  activePromptAttributes: {},
  form: null,
};

NameGenerator.propTypes = {
  activePromptAttributes: PropTypes.object,
  addNodes: PropTypes.func.isRequired,
  form: PropTypes.object,
  newNodeAttributes: PropTypes.object.isRequired,
  nodesForPrompt: PropTypes.array.isRequired,
  nodeIconName: PropTypes.string.isRequired,
  prompt: PropTypes.object.isRequired,
  promptBackward: PropTypes.func.isRequired,
  promptForward: PropTypes.func.isRequired,
  stage: PropTypes.object.isRequired,
  updateNode: PropTypes.func.isRequired,
};

function makeMapStateToProps() {
  const networkNodesForPrompt = makeNetworkNodesForPrompt();
  const getPromptNodeAttributes = makeGetPromptNodeAttributes();
  const getNodeIconName = makeGetNodeIconName();

  return function mapStateToProps(state, props) {
    return {
      activePromptAttributes: props.prompt.additionalAttributes,
      newNodeAttributes: getPromptNodeAttributes(state, props),
      nodesForPrompt: networkNodesForPrompt(state, props),
      nodeIconName: getNodeIconName(state, props),
    };
  };
}

function mapDispatchToProps(dispatch) {
  return {
    addNodes: bindActionCreators(sessionsActions.addNodes, dispatch),
    updateNode: bindActionCreators(sessionsActions.updateNode, dispatch),
  };
}

export default compose(
  withPrompt,
  connect(makeMapStateToProps, mapDispatchToProps),
)(NameGenerator);

export {
  NameGenerator as UnconnectedNameGenerator,
};

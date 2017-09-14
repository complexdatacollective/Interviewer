import React, { Component } from 'react';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import withPrompt from '../../behaviours/withPrompt';
import { actionCreators as networkActions } from '../../ducks/modules/network';
import { actionCreators as modalActions } from '../../ducks/modules/modals';
import { networkNodesForPrompt } from '../../selectors/interface';
import { PromptSwiper, NodeProviderPanels, NodeForm } from '../../containers/Elements';
import { NodeList, NodeBin } from '../../components/Elements';

const modals = {
  ADD_NODE: Symbol('ADD_NODE'),
  EDIT_NODE: Symbol('EDIT_NODE'),
};

// Render method for the node labels
const label = node => `${node.nickname}`;


/**
  * Name Generator Interface
  * @extends Component
  */
class NameGenerator extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedNode: null,
    };
  }

  /**
   * New node submit handler
   * @param {object} formData - key/value object containing node fields
   */
  onSubmitNewNode = (formData) => {
    if (formData) {
      this.props.addNode({ ...formData, ...this.props.newNodeAttributes });
    }
  }

  /**
   * Edit node submit handler
   * @param {object} formData - key/value object containing node fields
   */
  onSubmitEditNode = (formData) => {
    if (formData) {
      this.props.updateNode({ ...this.state.selectedNode, ...formData });
    }
  }

  /**
   * Click node handler
   * Triggers the edit node form
   * @param {object} node - key/value object containing node object from the network store
   */
  onSelectNode = (node) => {
    this.setState({ selectedNode: node }, () => {
      this.props.openModal(modals.EDIT_NODE);
    });
  }

  /**
   * Drop node handler
   * Deletes node from network when dropped on bin
   * @param {object} node - key/value object containing node object from the network store
   */
  onDropNode = (hits, node) => {
    hits.forEach((hit) => {
      switch (hit.name) {
        case 'NODE_BIN':
          this.props.removeNode(node.uid);
          break;
        default:
      }
    });
  }

  render() {
    const {
      openModal,
      promptForward,
      promptBackward,
      prompt,
      nodesForPrompt,
      stage,
    } = this.props;

    const {
      form,
      prompts,
    } = this.props.stage.params;

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
            <NodeProviderPanels stage={stage} prompt={prompt} />
          </div>
          <div className="name-generator-interface__nodes">
            <NodeList
              nodes={nodesForPrompt}
              label={label}
              droppableName="MAIN_NODE_LIST"
              acceptsDraggableType="NEW_NODE"
              draggableType="EXISTING_NODE"
              handleDropNode={this.onDropNode}
              handleSelectNode={this.onSelectNode}
            />
          </div>
        </div>

        <NodeForm
          node={this.state.selectedNode}
          modalName={modals.EDIT_NODE}
          form={form}
          handleSubmit={this.onSubmitEditNode}
        />

        <NodeForm
          modalName={modals.ADD_NODE}
          form={form}
          handleSubmit={this.onSubmitNewNode}
        />

        <button className="name-generator-interface__add-person" onClick={() => openModal(modals.ADD_NODE)}>
          Add a person
        </button>

        <div className="name-generator-interface__node-bin">
          <NodeBin />
        </div>
      </div>
    );
  }
}

NameGenerator.propTypes = {
  nodesForPrompt: PropTypes.array.isRequired,
  stage: PropTypes.object.isRequired,
  prompt: PropTypes.object.isRequired,
  addNode: PropTypes.func.isRequired,
  updateNode: PropTypes.func.isRequired,
  openModal: PropTypes.func.isRequired,
  removeNode: PropTypes.func.isRequired,
  newNodeAttributes: PropTypes.object.isRequired,
  promptForward: PropTypes.func.isRequired,
  promptBackward: PropTypes.func.isRequired,
};

function mapStateToProps(state, props) {
  const newNodeAttributes = {
    type: props.stage.params.nodeType,
    stageId: props.stage.id,
    promptId: props.prompt.id,
    ...props.prompt.nodeAttributes,
  };

  return {
    newNodeAttributes,
    nodesForPrompt: networkNodesForPrompt(state, props),
  };
}

function mapDispatchToProps(dispatch) {
  return {
    addNode: bindActionCreators(networkActions.addNode, dispatch),
    updateNode: bindActionCreators(networkActions.updateNode, dispatch),
    removeNode: bindActionCreators(networkActions.removeNode, dispatch),
    closeModal: bindActionCreators(modalActions.closeModal, dispatch),
    openModal: bindActionCreators(modalActions.openModal, dispatch),
  };
}

export default compose(
  withPrompt,
  connect(mapStateToProps, mapDispatchToProps),
)(NameGenerator);

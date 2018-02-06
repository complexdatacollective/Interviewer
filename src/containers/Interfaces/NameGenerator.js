import React, { Component } from 'react';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { get, has } from 'lodash';
import withPrompt from '../../behaviours/withPrompt';
import { actionCreators as networkActions } from '../../ducks/modules/network';
import { actionCreators as modalActions } from '../../ducks/modules/modals';
import { makeNetworkNodesForPrompt } from '../../selectors/interface';
import { makeGetPromptNodeAttributes } from '../../selectors/name-generator';
import { PromptSwiper, NodePanels, NodeForm } from '../../containers/';
import { NodeList, NodeBin } from '../../components/';
import { makeRehydrateForm } from '../../selectors/rehydrate';

const forms = {
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
      this.props.openModal(forms.EDIT_NODE);
    });
  }

  /**
   * Drop node handler
   * Deletes node from network whe  n dropped on bin
   * @param {object} node - key/value object containing node object from the network store
   */
  onDrop = (item) => {
    const node = { ...item.meta };

    if (has(node, 'promptId') || has(node, 'stageId')) {
      this.props.updateNode({ ...node, ...this.props.activePromptAttributes });
    } else {
      this.props.addNode({ ...node, ...this.props.newNodeAttributes });
    }
  }

  render() {
    const {
      openModal,
      promptForward,
      promptBackward,
      prompt,
      nodesForPrompt,
      stage,
      form,
    } = this.props;

    const {
      prompts,
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
              label={label}
              listId={`${stage.id}_${prompt.id}_MAIN_NODE_LIST`}
              id={'MAIN_NODE_LIST'}
              accepts={({ meta }) => get(meta, 'itemType', null) === 'NEW_NODE'}
              itemType="EXISTING_NODE"
              onDrop={this.onDrop}
              onSelect={this.onSelectNode}
            />
          </div>
        </div>

        <NodeForm
          node={this.state.selectedNode}
          name={forms.EDIT_NODE}
          title={form.title}
          fields={form.fields}
          entity={form.entity}
          type={form.type}
          autoPopulate={form.autoPopulate}
          onSubmit={this.onSubmitEditNode}
        />

        <NodeForm
          name={forms.ADD_NODE}
          title={form.title}
          fields={form.fields}
          entity={form.entity}
          type={form.type}
          autoPopulate={form.autoPopulate}
          onSubmit={this.onSubmitNewNode}
          addAnother
        />

        <button className="name-generator-interface__add-person" onClick={() => openModal(forms.ADD_NODE)}>
          Add a person
        </button>

        <div className="name-generator-interface__node-bin">
          <NodeBin id="NODE_BIN" />
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
  activePromptAttributes: PropTypes.object.isRequired,
  newNodeAttributes: PropTypes.object.isRequired,
  promptForward: PropTypes.func.isRequired,
  promptBackward: PropTypes.func.isRequired,
  form: PropTypes.object.isRequired,
};

function makeMapStateToProps() {
  const networkNodesForPrompt = makeNetworkNodesForPrompt();
  const getPromptNodeAttributes = makeGetPromptNodeAttributes();
  const rehydrateForm = makeRehydrateForm();

  return function mapStateToProps(state, props) {
    return {
      activePromptAttributes: props.prompt.additionalAttributes,
      newNodeAttributes: getPromptNodeAttributes(state, props),
      nodesForPrompt: networkNodesForPrompt(state, props),
      form: rehydrateForm(state, props),
    };
  };
}

function mapDispatchToProps(dispatch) {
  return {
    addNode: bindActionCreators(networkActions.addNode, dispatch),
    updateNode: bindActionCreators(networkActions.updateNode, dispatch),
    closeModal: bindActionCreators(modalActions.closeModal, dispatch),
    openModal: bindActionCreators(modalActions.openModal, dispatch),
  };
}

export default compose(
  withPrompt,
  connect(makeMapStateToProps, mapDispatchToProps),
)(NameGenerator);

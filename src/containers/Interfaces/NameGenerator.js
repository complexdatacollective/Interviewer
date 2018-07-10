import React, { Component } from 'react';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { get, has } from 'lodash';
import withPrompt from '../../behaviours/withPrompt';
import { actionCreators as sessionsActions } from '../../ducks/modules/sessions';
import { actionCreators as modalActions } from '../../ducks/modules/modals';
import { getNodeLabelFunction, makeNetworkNodesForPrompt } from '../../selectors/interface';
import { makeGetPromptNodeAttributes } from '../../selectors/name-generator';
import { PromptSwiper, NodePanels, NodeForm } from '../';
import { NodeList, NodeBin } from '../../components/';
import { makeRehydrateForm } from '../../selectors/forms';

/**
  * Name Generator Interface
  * @extends Component
  */
class NameGenerator extends Component {
  constructor(props) {
    super(props);

    this.forms = {
      ADD_NODE: Symbol('ADD_NODE'),
      EDIT_NODE: Symbol('EDIT_NODE'),
    };

    this.state = {
      selectedNode: null,
    };
  }

  /**
   * New node submit handler
   */
  onSubmitNewNode = (formData) => {
    if (formData) {
      this.props.addNodes({ ...formData, ...this.props.newNodeAttributes });
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
      if (this.props.form) {
        this.props.openModal(this.forms.EDIT_NODE);
      }
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
      this.props.addNodes({ ...node, ...this.props.newNodeAttributes });
    }
  }

  render() {
    const {
      form,
      getLabel,
      nodesForPrompt,
      openModal,
      prompt,
      promptBackward,
      promptForward,
      stage,
    } = this.props;

    const {
      prompts,
    } = this.props.stage;

    const nodeForms = form && (
      <React.Fragment>
        <NodeForm
          node={this.state.selectedNode}
          name={this.forms.EDIT_NODE}
          title={form.title}
          fields={form.fields}
          entity={form.entity}
          type={form.type}
          autoPopulate={form.autoPopulate}
          onSubmit={this.onSubmitEditNode}
        />
        <NodeForm
          name={this.forms.ADD_NODE}
          title={form.title}
          fields={form.fields}
          entity={form.entity}
          type={form.type}
          autoPopulate={form.autoPopulate}
          onSubmit={this.onSubmitNewNode}
          showAddAnotherToggle={form.optionToAddAnother}
        />
        <button className="name-generator-interface__add-person" onClick={() => openModal(this.forms.ADD_NODE)}>
          Add a person
        </button>
      </React.Fragment>
    );

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
              label={getLabel}
              listId={`${stage.id}_${prompt.id}_MAIN_NODE_LIST`}
              id={'MAIN_NODE_LIST'}
              accepts={({ meta }) => get(meta, 'itemType', null) === 'NEW_NODE'}
              itemType="EXISTING_NODE"
              onDrop={this.onDrop}
              onSelect={this.onSelectNode}
            />
          </div>
        </div>

        { nodeForms }

        <div className="name-generator-interface__node-bin">
          <NodeBin id="NODE_BIN" />
        </div>
      </div>
    );
  }
}

NameGenerator.defaultProps = {
  activePromptAttributes: {},
};

NameGenerator.propTypes = {
  activePromptAttributes: PropTypes.object,
  addNodes: PropTypes.func.isRequired,
  form: PropTypes.object.isRequired,
  getLabel: PropTypes.func.isRequired,
  newNodeAttributes: PropTypes.object.isRequired,
  nodesForPrompt: PropTypes.array.isRequired,
  openModal: PropTypes.func.isRequired,
  prompt: PropTypes.object.isRequired,
  promptBackward: PropTypes.func.isRequired,
  promptForward: PropTypes.func.isRequired,
  stage: PropTypes.object.isRequired,
  updateNode: PropTypes.func.isRequired,
};

function makeMapStateToProps() {
  const networkNodesForPrompt = makeNetworkNodesForPrompt();
  const getPromptNodeAttributes = makeGetPromptNodeAttributes();
  const rehydrateForm = makeRehydrateForm();

  return function mapStateToProps(state, props) {
    return {
      activePromptAttributes: props.prompt.additionalAttributes,
      form: rehydrateForm(state, props),
      getLabel: getNodeLabelFunction(state),
      newNodeAttributes: getPromptNodeAttributes(state, props),
      nodesForPrompt: networkNodesForPrompt(state, props),
    };
  };
}

function mapDispatchToProps(dispatch) {
  return {
    addNodes: bindActionCreators(sessionsActions.addNodes, dispatch),
    closeModal: bindActionCreators(modalActions.closeModal, dispatch),
    openModal: bindActionCreators(modalActions.openModal, dispatch),
    updateNode: bindActionCreators(sessionsActions.updateNode, dispatch),
  };
}

export default compose(
  withPrompt,
  connect(makeMapStateToProps, mapDispatchToProps),
)(NameGenerator);

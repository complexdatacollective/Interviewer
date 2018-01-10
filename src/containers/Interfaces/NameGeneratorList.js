import React, { Component } from 'react';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { differenceBy } from 'lodash';

import withPrompt from '../../behaviours/withPrompt';
import { actionCreators as networkActions } from '../../ducks/modules/network';
import { actionCreators as modalActions } from '../../ducks/modules/modals';
import { makeNetworkNodesForPrompt } from '../../selectors/interface';
import { makeGetPromptNodeAttributes, getDataByPrompt } from '../../selectors/name-generator';
import { PromptSwiper, NodeForm } from '../../containers';
import { ListSelect, NodeList, NodeBin } from '../../components';
import { makeRehydrateForm } from '../../selectors/rehydrate';

const modals = {
  EDIT_NODE: Symbol('EDIT_NODE'),
  LIST_SELECT: Symbol('LIST_SELECT'),
};

// Render method for the node labels
const labelKey = 'nickname';
const label = node => `${node[labelKey]}`;
const details = node => [{ name: `${node.name}` }, { age: `${node.age}` }];

/**
  * Name Generator List Interface
  * @extends Component
  */
class NameGeneratorList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedNode: null,
    };
  }

  /**
   * New node submit handler
   */
  onSubmitNewNodes = (selectedNodes) => {
    if (selectedNodes) {
      selectedNodes.map(
        selectedNode =>
          this.props.addOrUpdateNode({ ...selectedNode, ...this.props.newNodeAttributes }),
      );
    }
    this.props.closeModal(modals.LIST_SELECT);
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

  render() {
    const {
      form,
      nodesForList,
      nodesForPrompt,
      openModal,
      prompt,
      promptBackward,
      promptForward,
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
          <div className="name-generator-interface__nodes">
            <NodeList
              id="MAIN_NODE_LIST"
              itemType="EXISTING_NODE"
              label={label}
              nodes={nodesForPrompt}
              onSelect={this.onSelectNode}
            />
          </div>
        </div>

        <NodeForm
          autoPopulate={form.autoPopulate}
          entity={form.entity}
          fields={form.fields}
          name={modals.EDIT_NODE}
          node={this.state.selectedNode}
          onSubmit={this.onSubmitEditNode}
          title={form.title}
          type={form.type}
        />

        <ListSelect
          details={details}
          label={label}
          labelKey={labelKey}
          name={modals.LIST_SELECT}
          nodes={nodesForList}
          onSubmit={this.onSubmitNewNodes}
        />

        <button className="name-generator-interface__add-person" onClick={() => openModal(modals.LIST_SELECT)}>
          Add a person
        </button>

        <div className="name-generator-interface__node-bin">
          <NodeBin id="NODE_BIN" />
        </div>
      </div>
    );
  }
}

NameGeneratorList.propTypes = {
  addOrUpdateNode: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  form: PropTypes.object.isRequired,
  newNodeAttributes: PropTypes.object.isRequired,
  nodesForList: PropTypes.array.isRequired,
  nodesForPrompt: PropTypes.array.isRequired,
  openModal: PropTypes.func.isRequired,
  prompt: PropTypes.object.isRequired,
  promptForward: PropTypes.func.isRequired,
  promptBackward: PropTypes.func.isRequired,
  stage: PropTypes.object.isRequired,
  updateNode: PropTypes.func.isRequired,
};

function makeMapStateToProps() {
  const networkNodesForPrompt = makeNetworkNodesForPrompt();
  const getPromptNodeAttributes = makeGetPromptNodeAttributes();
  const rehydrateForm = makeRehydrateForm();

  return function mapStateToProps(state, props) {
    return {
      form: rehydrateForm(state, props),
      newNodeAttributes: getPromptNodeAttributes(state, props),
      nodesForList: differenceBy(getDataByPrompt(state, props), networkNodesForPrompt(state, props), 'uid'),
      nodesForPrompt: networkNodesForPrompt(state, props),
    };
  };
}

function mapDispatchToProps(dispatch) {
  return {
    addOrUpdateNode: bindActionCreators(networkActions.addOrUpdateNode, dispatch),
    closeModal: bindActionCreators(modalActions.closeModal, dispatch),
    openModal: bindActionCreators(modalActions.openModal, dispatch),
    updateNode: bindActionCreators(networkActions.updateNode, dispatch),
  };
}

export default compose(
  withPrompt,
  connect(makeMapStateToProps, mapDispatchToProps),
)(NameGeneratorList);

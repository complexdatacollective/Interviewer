import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { actionCreators as networkActions } from '../../ducks/modules/network';
import {
  actionCreators as modalActions,
  modalNames as modals,
} from '../../ducks/modules/modals';
import { newNodeAttributes } from '../../selectors/session';
import { activeOriginNetwork } from '../../selectors/network';
import { PromptSwiper, NodeProviderPanels, NodeForm } from '../../containers/Elements';
import { NodeList, NodeBin } from '../../components/Elements';

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
    } = this.props;

    const {
      form,
      prompts,
      panels,
    } = this.props.config.params;

    return (
      <div className="name-generator">
        <div className="name-generator__prompt">
          <PromptSwiper prompts={prompts} />
        </div>
        <div className="name-generator__main">
          <div className="name-generator__panels">
            <NodeProviderPanels config={panels} />
          </div>
          <div className="name-generator__nodes">
            <NodeList
              network={this.props.activeOriginNetwork}
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

        <button className="name-generator__add-person" onClick={() => openModal(modals.ADD_NODE)}>
          Add a person
        </button>

        <NodeBin />
      </div>
    );
  }
}

NameGenerator.propTypes = {
  config: PropTypes.object.isRequired,
  addNode: PropTypes.func.isRequired,
  updateNode: PropTypes.func.isRequired,
  openModal: PropTypes.func.isRequired,
  newNodeAttributes: PropTypes.any.isRequired,
  activeOriginNetwork: PropTypes.any.isRequired,
  removeNode: PropTypes.func.isRequired,
};

function mapStateToProps(state) {
  return {
    newNodeAttributes: newNodeAttributes(state),
    activeOriginNetwork: activeOriginNetwork(state),
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

export default connect(mapStateToProps, mapDispatchToProps)(NameGenerator);

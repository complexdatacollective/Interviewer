import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { actionCreators as networkActions } from '../../ducks/modules/network';
import { actionCreators as modalActions } from '../../ducks/modules/modals';
import { newNodeAttributes } from '../../selectors/session';
import { activeOriginNetwork } from '../../selectors/network';
import { PromptSwiper, NodeProviderPanels, Modal } from '../../containers/Elements';
import { NodeList, Form, DropZone } from '../../components/Elements';

const MODAL_NEW_NODE = 'MODAL_NEW_NODE';

/**
  * This would/could be specified in the protocol, and draws upon ready made components
  */
class NameGenerator extends Component {
  handleAddNode = (node, _, form) => {
    const {
      addNode,
      closeModal,
    } = this.props;

    if (node) {
      addNode({ ...node, ...this.props.newNodeAttributes });
      form.reset();  // Is this the "react/redux way"?
      closeModal(MODAL_NEW_NODE);
    }
  }

  handleDropNode = (hits, node) => {
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
      config: {
        params: {
          form,
          prompts,
          panels,
        },
      },
      openModal,
    } = this.props;

    const nodeBin = (
      <div className="name-generator__node-bin">
        <DropZone droppableName="NODE_BIN" acceptsDraggableType="EXISTING_NODE" />
      </div>
    );

    const label = node => `${node.nickname}`;

    return (
      <div className="name-generator">
        <div className="name-generator__prompt">
          <PromptSwiper prompts={prompts} />
        </div>
        <div className="name-generator__main">
          <div className="name-generator__panels">
            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
              <NodeProviderPanels config={panels} />
            </div>
          </div>
          <div className="name-generator__nodes">
            <NodeList
              network={this.props.activeOriginNetwork}
              label={label}
              droppableName="MAIN_NODE_LIST"
              acceptsDraggableType="NEW_NODE"
              draggableType="EXISTING_NODE"
              handleDropNode={this.handleDropNode}
            />
          </div>
        </div>

        <Modal name={MODAL_NEW_NODE} title={form.title} >
          <Form {...form} form={form.formName} onSubmit={this.handleAddNode} />
        </Modal>

        <button className="name-generator__add-person" onClick={() => openModal(MODAL_NEW_NODE)}>
          Add a person
        </button>

        {this.props.isDraggableDeleteable ? nodeBin : ''}
      </div>
    );
  }
}

NameGenerator.propTypes = {
  config: PropTypes.object.isRequired,
  addNode: PropTypes.func.isRequired,
  removeNode: PropTypes.func.isRequired,
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  newNodeAttributes: PropTypes.any.isRequired,
  activeOriginNetwork: PropTypes.any.isRequired,
  isDraggableDeleteable: PropTypes.bool.isRequired,
};

function mapStateToProps(state) {
  return {
    newNodeAttributes: newNodeAttributes(state),
    activeOriginNetwork: activeOriginNetwork(state),
    isDraggableDeleteable: state.draggable.isDragging && state.draggable.draggableType === 'EXISTING_NODE',
  };
}

function mapDispatchToProps(dispatch) {
  return {
    addNode: bindActionCreators(networkActions.addNode, dispatch),
    removeNode: bindActionCreators(networkActions.removeNode, dispatch),
    closeModal: bindActionCreators(modalActions.closeModal, dispatch),
    openModal: bindActionCreators(modalActions.openModal, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(NameGenerator);

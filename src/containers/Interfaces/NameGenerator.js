import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

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
      newNodeAttributes,
      closeModal,
    } = this.props;

    if (node) {
      addNode({ ...node, ...newNodeAttributes });
      form.reset();  // Is this the "react/redux way"?
      closeModal(MODAL_NEW_NODE);
    }
  }

  handleDropNode = (hits, node) => {
    hits.map((hit) => {
      switch (hit.name) {
        case 'NODE_BIN':
          return this.props.removeNode(node.uid);
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
      activeOriginNetwork,
    } = this.props;

    const nodeBin = (
      <div className='name-generator__node-bin'>
        <DropZone droppableName='NODE_BIN' acceptsDraggableType='EXISTING_NODE' />
      </div>
    );

    return (
      <div className='name-generator'>
        <div className='name-generator__prompt'>
          <PromptSwiper prompts={ prompts } />
        </div>
        <div className='name-generator__main'>
          <div className='name-generator__panels'>
            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
              <NodeProviderPanels config={ panels } />
            </div>
          </div>
          <div className='name-generator__nodes'>
            <NodeList network={ activeOriginNetwork } label={ (node) => `${node.nickname}` } droppableName='MAIN_NODE_LIST' acceptsDraggableType='NEW_NODE' draggableType='EXISTING_NODE' handleDropNode={ this.handleDropNode } />
          </div>
          <button className='name-generator__add-person' onClick={ () => { openModal(MODAL_NEW_NODE) } }>
            Add a person
          </button>
          { this.props.isDragging ? nodeBin : '' }
        </div>

        <Modal name={ MODAL_NEW_NODE } >
          <Form { ...form } form={ form.formName } onSubmit={ this.handleAddNode }/>
        </Modal>
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    newNodeAttributes: newNodeAttributes(state),
    activeOriginNetwork: activeOriginNetwork(state),
    isDragging: state.draggable.isDragging,
  }
}

function mapDispatchToProps(dispatch) {
  return {
    addNode: bindActionCreators(networkActions.addNode, dispatch),
    removeNode: bindActionCreators(networkActions.removeNode, dispatch),
    closeModal: bindActionCreators(modalActions.closeModal, dispatch),
    openModal: bindActionCreators(modalActions.openModal, dispatch),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(NameGenerator);

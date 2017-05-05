import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { actionCreators as networkActions } from '../../ducks/modules/network';
import { actionCreators as modalActions } from '../../ducks/modules/modals';
import { activeNodeAttributes } from '../../selectors/session';
import { activePromptNetwork } from '../../selectors/network';

import { PromptSwiper, NodeProviderPanels, Modal } from '../../containers/Elements';
import { NodeList, Form } from '../../components/Elements';

const MODAL_NEW_NODE = 'MODAL_NEW_NODE';

/**
  * This would/could be specified in the protocol, and draws upon ready made components
  */
class NameGenerator extends Component {
  handleAddNode = (node, _, form) => {
    const {
      addNode,
      activeNodeAttributes,
      closeModal,
    } = this.props;

    if (node) {
      addNode({ ...node, ...activeNodeAttributes });
      form.reset();  // Is this the "react/redux way"?
      closeModal(MODAL_NEW_NODE);
    }
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
      activePromptNetwork,
    } = this.props;

    return (
      <div className='interface'>
        <div className='interface__aside'>
          <NodeProviderPanels config={ panels } />
        </div>
        <div className='interface__primary'>
          <PromptSwiper prompts={ prompts } />

          <NodeList network={ activePromptNetwork } />

          <button onClick={ () => { openModal(MODAL_NEW_NODE) } }>
            Add a person
          </button>

          <Modal name={ MODAL_NEW_NODE } >
            <Form { ...form } form={ form.formName } onSubmit={ this.handleAddNode }/>
          </Modal>
        </div>
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    network: state.network,
    protocol: state.protocol,
    activeNodeAttributes: activeNodeAttributes(state),
    activePromptNetwork: activePromptNetwork(state),
  }
}

function mapDispatchToProps(dispatch) {
  return {
    addNode: bindActionCreators(networkActions.addNode, dispatch),
    closeModal: bindActionCreators(modalActions.closeModal, dispatch),
    openModal: bindActionCreators(modalActions.openModal, dispatch),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(NameGenerator);

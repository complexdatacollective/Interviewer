import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { createSelector } from 'reselect'

import { actionCreators as modalActions } from '../../ducks/modules/modals';

import { Modal as ModalComponent } from '../../components/Elements';

const modals = state => state.modals
const modalName = (state, props) => props.name

const modal = createSelector(
  modals,
  modalName,
  (modals, modalName) => modals.find(modal => modal.name === modalName)
)

const modalIsOpen = createSelector(
  modal,
  (modal) => { if (modal) { return modal.open } else { return false } }
)

class Modal extends Component {

  toggleModal = () => {
    this.props.toggleModal(this.props.name);
  }

  componentWillMount() {
    this.props.registerModal(this.props.name);
  }

  componentWillUnmount() {
    this.props.unregisterModal(this.props.name);
  }

  render() {
    return (
      <ModalComponent show={ this.props.isOpen } onClose={ this.toggleModal } title={ this.props.title } >
        { this.props.children }
      </ModalComponent>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    isOpen: modalIsOpen(state, ownProps),
  }
}

function mapDispatchToProps(dispatch) {
  return {
    toggleModal: bindActionCreators(modalActions.toggleModal, dispatch),
    registerModal: bindActionCreators(modalActions.registerModal, dispatch),
    unregisterModal: bindActionCreators(modalActions.registerModal, dispatch),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Modal);

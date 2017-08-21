/* eslint-disable no-shadow */
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { createSelector } from 'reselect';

import { actionCreators as modalActions } from '../../ducks/modules/modals';

import { Dialog as DialogComponent } from '../../components/Elements';

const modals = state => state.modals;
const modalName = (state, props) => props.name;

const modal = createSelector(
  modals,
  modalName,
  (modals, modalName) => modals.find(modal => modal.name === modalName),
);

const modalIsOpen = createSelector(
  modal,
  modal => (modal ? modal.open : false),
);

/**
  * A modal window which can be toggled open an closed.
  * @extends Component
  */
class Dialog extends Component {

  componentWillMount() {
    this.props.registerModal(this.props.name);
  }

  componentWillUnmount() {
    this.props.unregisterModal(this.props.name);
  }

  confirmModal = () => {
    this.props.toggleModal(this.props.name);
    this.props.onConfirm();
  };

  cancelModal = () => {
    this.props.toggleModal(this.props.name);
    this.props.onCancel();
  };

  render() {
    const {
      title,
      children,
      show,
      hasCancelButton,
      type,
    } = this.props;

    return (
      <DialogComponent
        show={show}
        title={title}
        name={modalName}
        hasCancelButton={hasCancelButton}
        type={type}
        onConfirm={this.confirmModal}
        onCancel={this.cancelModal}
      >
        {children}
      </DialogComponent>
    );
  }
}

Dialog.propTypes = {
  registerModal: PropTypes.func.isRequired,
  unregisterModal: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  hasCancelButton: PropTypes.bool,
  toggleModal: PropTypes.func.isRequired,
  show: PropTypes.bool,
  children: PropTypes.any,
  onCancel: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
};

Dialog.defaultProps = {
  show: false,
  hasCancelButton: true,
  children: null,
};

function mapStateToProps(state, ownProps) {
  return {
    show: modalIsOpen(state, ownProps),
  };
}

function mapDispatchToProps(dispatch) {
  return {
    toggleModal: bindActionCreators(modalActions.toggleModal, dispatch),
    registerModal: bindActionCreators(modalActions.registerModal, dispatch),
    unregisterModal: bindActionCreators(modalActions.registerModal, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Dialog);

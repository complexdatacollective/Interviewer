/* eslint-disable no-shadow */
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { createSelector } from 'reselect';

import { actionCreators as modalActions } from '../ducks/modules/modals';

const modals = state => state.modals;
const modalName = (state, props) => props.name;

const modalState = createSelector(
  modals,
  modalName,
  (modals, modalName) => modals.find(modal => modal.name === modalName),
);

const makeModalIsOpen = () =>
  createSelector(
    modalState,
    modal => (modal ? modal.open : false),
  );

function modal(WrappedComponent) {
  class Modal extends Component {
    componentWillMount() {
      this.props.registerModal(this.props.name);
    }

    componentDidUpdate(prevProps) {
      if (prevProps.isRegistered && !this.props.isRegistered) {
        // registration was removed (e.g., from app reset), but component is still mounted
        this.props.registerModal(this.props.name);
      }
    }

    componentWillUnmount() {
      this.props.unregisterModal(this.props.name);
    }

    toggle = () => this.props.toggleModal(this.props.name);
    open = () => this.props.openModal(this.props.name);
    close = () => {
      this.props.closeModal(this.props.name);
      if (this.props.onCloseModal) {
        this.props.onCloseModal();
      }
    }

    render() {
      return (
        <WrappedComponent
          show={this.props.show}
          toggle={this.toggle}
          open={this.close}
          close={this.close}
          ref={this.props.forwardedRef}
          {...this.props}
        />
      );
    }
  }

  Modal.propTypes = {
    forwardedRef: PropTypes.object,
    isRegistered: PropTypes.bool.isRequired,
    registerModal: PropTypes.func.isRequired,
    unregisterModal: PropTypes.func.isRequired,
    name: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.symbol,
    ]).isRequired,
    toggleModal: PropTypes.func.isRequired,
    openModal: PropTypes.func.isRequired,
    closeModal: PropTypes.func.isRequired,
    onCloseModal: PropTypes.func,
    show: PropTypes.bool,
  };

  Modal.defaultProps = {
    forwardedRef: null,
    show: false,
    onCloseModal: null,
  };

  function makeMapStateToProps() {
    const modalIsOpen = makeModalIsOpen();

    return function mapStateToProps(state, props) {
      return {
        show: modalIsOpen(state, props),
        isRegistered: state.modals.some(m => m.name === props.name),
      };
    };
  }

  function mapDispatchToProps(dispatch) {
    return {
      toggleModal: bindActionCreators(modalActions.toggleModal, dispatch),
      openModal: bindActionCreators(modalActions.openModal, dispatch),
      closeModal: bindActionCreators(modalActions.closeModal, dispatch),
      registerModal: bindActionCreators(modalActions.registerModal, dispatch),
      unregisterModal: bindActionCreators(modalActions.unregisterModal, dispatch),
    };
  }

  const ConnectedModal = connect(makeMapStateToProps, mapDispatchToProps)(Modal);
  return React.forwardRef((props, ref) => <ConnectedModal {...props} forwardedRef={ref} />);
}

export default modal;

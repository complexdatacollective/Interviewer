/* eslint-disable no-shadow, react/no-unused-prop-types */

import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { actionCreators as modalActions } from '../../ducks/modules/modals';
import { Dialog } from '../../containers/Elements';

/**
  * Modal Node Form, than can handle new/editing of nodes
  * @extends Component
  */
class InfoDialog extends Component {

  onCamcel = () => {
    this.props.closeModal(this.props.modalName);
  }

  onConfirm = () => {
    this.props.closeModal(this.props.modalName);
  }

  render() {
    const {
      modalName,
      title,
      children,
      type,
      show,
      onCancel,
      onConfirm,
    } = this.props;

    return (
      <Dialog
        name={modalName}
        title={title}
        type={type}
        show={show}
        onConfirm={onCancel}
        onCancel={onConfirm}
      >
        {children}
      </Dialog>
    );
  }
}

InfoDialog.propTypes = {
  modalName: PropTypes.string.isRequired,
  title: PropTypes.string,
  children: PropTypes.any,
  show: PropTypes.bool,
  type: PropTypes.string,
  showCancelButton: PropTypes.bool,
  closeModal: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
};

InfoDialog.defaultProps = {
  title: 'This is my dialog title',
  children: null,
  show: false,
  type: 'info',
  showCancelButton: true,
};

function mapStateToProps() {
  return {
  };
}

function mapDispatchToProps(dispatch) {
  return {
    closeModal: bindActionCreators(modalActions.closeModal, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(InfoDialog);

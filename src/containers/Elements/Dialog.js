/* eslint-disable no-shadow */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Dialog as DialogComponent } from '../../components/Elements';
import modal from '../../behaviours/modal';

/**
  * A modal window which can be toggled open an closed.
  * @extends Component
  */
class Dialog extends Component {

  confirmModal = () => {
    this.props.close();
    this.props.onConfirm();
  };

  cancelModal = () => {
    this.props.close();
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
  type: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  hasCancelButton: PropTypes.bool,
  show: PropTypes.bool,
  children: PropTypes.any,
  onCancel: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  close: PropTypes.func.isRequired,
};

Dialog.defaultProps = {
  show: false,
  hasCancelButton: true,
  children: null,
};


export default modal(Dialog);

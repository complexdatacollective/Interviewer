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

  static defaultProps = {
  }

  render() {
    return (
      <Dialog {...this.props} />
    );
  }
}

InfoDialog.propTypes = {
  name: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  children: PropTypes.any,
  show: PropTypes.bool,
  hasCancelButton: PropTypes.bool,
  type: PropTypes.string,
  closeModal: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
};

InfoDialog.defaultProps = {
  children: null,
  show: false,
  type: 'info',
  hasCancelButton: true,
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

/* eslint-disable no-shadow */
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { createSelector } from 'reselect';

import { actionCreators as dialogActions } from '../../ducks/modules/dialogs';

import { Dialog as DialogComponent } from '../../components/Elements';

const dialogs = state => state.dialogs;
const dialogName = (state, props) => props.name;

const dialog = createSelector(
  dialogs,
  dialogName,
  (dialogs, dialogName) => dialogs.find(dialog => dialog.name === dialogName),
);

const dialogIsOpen = createSelector(
  dialog,
  dialog => (dialog ? dialog.open : false),
);

/**
  * A dialog window which can be toggled open an closed.
  * @extends Component
  */
class Dialog extends Component {

  componentWillMount() {
    this.props.registerDialog(this.props.name);
  }

  componentWillUnmount() {
    this.props.unregisterDialog(this.props.name);
  }

  toggleDialog = () => this.props.toggleDialog(this.props.name);

  render() {
    return (
      <DialogComponent show={this.props.isOpen} onClose={this.toggleDialog} title={this.props.title} >
        {this.props.children}
      </DialogComponent>
    );
  }
}

Dialog.propTypes = {
  registerDialog: PropTypes.func.isRequired,
  unregisterDialog: PropTypes.func.isRequired,
  toggleDialog: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  isOpen: PropTypes.bool,
  children: PropTypes.any,
};

Dialog.defaultProps = {
  isOpen: false,
  children: null,
};

function mapStateToProps(state, ownProps) {
  return {
    isOpen: dialogIsOpen(state, ownProps),
  };
}

function mapDispatchToProps(dispatch) {
  return {
    toggleDialog: bindActionCreators(dialogActions.toggleDialog, dispatch),
    registerDialog: bindActionCreators(dialogActions.registerDialog, dispatch),
    unregisterDialog: bindActionCreators(dialogActions.registerDialog, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Dialog);

/* eslint-disable jsx-a11y/no-static-element-interactions */

import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Button, Icon } from 'network-canvas-ui'; // eslint-disable-line
import { actionCreators as errorActions } from '../ducks/modules/errors';
import { Dialog } from '../components';

/**
  * Renders a dialog box.
  */
const ErrorMessage = ({
  errorMessage,
  acknowledged,
  acknowledgeError,
}) => {
  const isActive = (!!errorMessage && !acknowledged);

  return (
    <Dialog
      title="Something went wrong!"
      show={isActive}
      type="error"
      hasCancelButton={false}
      confirmLabel="Acknowledged"
      onConfirm={acknowledgeError}
    >
      {errorMessage}
    </Dialog>
  );
};

ErrorMessage.propTypes = {
  acknowledged: PropTypes.bool,
  errorMessage: PropTypes.string,
  acknowledgeError: PropTypes.func.isRequired,
};

ErrorMessage.defaultProps = {
  acknowledged: true,
  errorMessage: '',
};


const mapStateToProps = state => ({
  errorMessage: state.errors.errors.length > 0 ?
    state.errors.errors[state.errors.errors.length - 1] :
    '',
  acknowledged: state.errors.acknowledged,
});

const mapDispatchToProps = dispatch => ({
  acknowledgeError: bindActionCreators(errorActions.acknowledge, dispatch),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ErrorMessage);

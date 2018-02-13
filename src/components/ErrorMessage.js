/* eslint-disable jsx-a11y/no-static-element-interactions */

import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { last } from 'lodash';
import { Button, Icon } from 'network-canvas-ui'; // eslint-disable-line
import { actionCreators as errorActions } from '../ducks/modules/errors';
import { Dialog } from '../components';

const getErrorMessage = error =>
  !!error && (error.friendlyMessage ? error.friendlyMessage : error.toString());

const getStack = error => !!error && error.stack;

const renderAdditionalInformation = stack => ([
  <p><strong>Detailed information:</strong></p>,
  <code>{stack}</code>,
]);

/**
  * Renders a dialog box.
  */
const ErrorMessage = ({
  error,
  acknowledged,
  acknowledgeError,
}) => {
  const isActive = (!!error && !acknowledged);

  const stack = getStack(error);

  return (
    <Dialog
      title="Something went wrong!"
      show={isActive}
      type="error"
      hasCancelButton={false}
      confirmLabel="Acknowledged"
      onConfirm={acknowledgeError}
      additionalInformation={stack && renderAdditionalInformation(stack)}
    >
      {error && (
        <div>
          <p>{getErrorMessage(error)}</p>
        </div>
      )}
    </Dialog>
  );
};

ErrorMessage.propTypes = {
  acknowledged: PropTypes.bool,
  error: PropTypes.instanceOf(Error),
  acknowledgeError: PropTypes.func.isRequired,
};

ErrorMessage.defaultProps = {
  acknowledged: true,
  error: null,
};

const mapStateToProps = state => ({
  error: last(state.errors.errors) || null,
  acknowledged: state.errors.acknowledged,
});

const mapDispatchToProps = dispatch => ({
  acknowledgeError: bindActionCreators(errorActions.acknowledge, dispatch),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ErrorMessage);

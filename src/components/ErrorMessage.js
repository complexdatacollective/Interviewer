/* eslint-disable jsx-a11y/no-static-element-interactions */

import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Button, Icon } from 'network-canvas-ui'; // eslint-disable-line
import { actionCreators as errorActions } from '../ducks/modules/errors';
import { Modal } from '../components/Transition';

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
    <Modal in={isActive}>
      <div className="dialog">
        <div className="dialog__window" onClick={e => e.stopPropagation()}>
          <div className="dialog__main">
            <div className="dialog__main-icon">
              <Icon name="error" />
            </div>
            <div className="dialog__main-content">
              <h2 className="dialog__main-title">Something went wrong!</h2>
              {errorMessage}
            </div>
          </div>
          <footer className="dialog__footer">
            <Button onClick={acknowledgeError} content="Acknowledged" />
          </footer>
        </div>
      </div>
    </Modal>
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

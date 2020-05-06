import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { actionCreators as dialogActions } from '../../ducks/modules/dialogs';
import { Overlay } from '../Overlay';
import ServerPairing from './ServerPairing';


const PairingCodeDialog = (props) => {
  const {
    show,
    handleClose,
    handleSuccess,
    openDialog,
    server,
  } = props;

  const handleError = (error) => {
    openDialog({
      type: 'Error',
      error,
      confirmLabel: 'Okay',
    });
  };

  return (
    <Overlay title="Enter a Pairing Code" show={show} onClose={handleClose}>
      <ServerPairing
        server={server}
        onComplete={handleSuccess}
        onError={handleError}
        onCancel={() => handleClose()}
      />
    </Overlay>
  );
};

PairingCodeDialog.propTypes = {
  handleClose: PropTypes.func.isRequired,
  handleSuccess: PropTypes.func.isRequired,
};

PairingCodeDialog.defaultProps = {
};

function mapStateToProps(state) {
  return {
    // show: !!state.ui.showPairingCodeDialog,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    openDialog: dialogActions.openDialog,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(PairingCodeDialog);

import React, { useState } from 'react';
import { connect } from 'react-redux';
import { submit, isInvalid } from 'redux-form';
import { Button } from '@codaco/ui';
import { Toggle } from '@codaco/ui/lib/components/Fields';
import { actionCreators as uiActions } from '../../ducks/modules/ui';
import { actionCreators as dialogActions } from '../../ducks/modules/dialogs';
import { Overlay } from '../Overlay';
import { DiscoveredServerList, ServerAddressForm } from '../../components/SetupScreen';
import PairingCodeDialog from './PairingCodeDialog';
import { addPairingUrlToService } from '../../utils/serverAddressing';

const PairingOverlay = (props) => {
  const {
    show,
    close,
    submitForm,
    openDialog,
    isManualFormInvalid,
  } = props;

  const [autoPairingMode, setAutoPairingMode] = useState(true);

  const [showPairingCodeDialog, setShowPairingCodeDialog] = useState(false);
  const [selectedServer, setSelectedServer] = useState(null);

  const pairClickHandler = () => {
    if (autoPairingMode) {
      if (selectedServer.pairingServiceUrl) {
        // Now show the pairing key
        setShowPairingCodeDialog(true);
      } else {
        openDialog({
          type: 'Error',
          error: 'Pairing request failed. An error occurred while attempting to send the pairing request.',
          confirmLabel: 'Okay',
        });
      }
    } else {
      // If we are in manual mode
      submitForm();
    }
  };

  const setServerFromDiscovery = (server) => {
    setSelectedServer(server);
  };

  const setServerFromFormValues = (values) => {
    console.log('settingserver', values);

    const serverWithPairingUrl = addPairingUrlToService({
      addresses: [values.serverAddress],
      port: 51001, // Port is set statically, since it cannot be changed in server.
    });

    setSelectedServer(serverWithPairingUrl);

    if (serverWithPairingUrl.pairingServiceUrl) {
      // Now show the pairing key
      setShowPairingCodeDialog(true);
    } else {
      openDialog({
        type: 'Error',
        error: 'Pairing request failed. An error occurred while attempting to send the pairing request.',
        confirmLabel: 'Okay',
      });
    }
  };

  return (
    <Overlay
      show={show}
      title="Pair with Server"
      onClose={() => close()}
      className="pairing-overlay"
    >
      { autoPairingMode ? (
        <React.Fragment>
          <h2>Automatic Server Discovery</h2>
          <p>
            Network Canvas can discover computers on the same Local Area Network that
            are running Server.
          </p>
          <DiscoveredServerList
            selectedServer={selectedServer}
            selectHandler={setServerFromDiscovery}
          />
        </React.Fragment>
      ) : (
        <React.Fragment>
          <h2>Manual Connection details</h2>
          <p>
            Enter the hostname or IP address of the computer running Server, and then
            click <strong>send pairing request</strong>. The computer you want to request
            pairing with must be reachable from this device using the details you provide.
          </p>
          <ServerAddressForm
            submitHandler={setServerFromFormValues}
          />
        </React.Fragment>

      )}
      <div className="pairing-overlay__footer">
        <Toggle
          input={{
            value: !autoPairingMode,
            onChange: () => {
              setSelectedServer(null);
              setAutoPairingMode(!autoPairingMode);
            },
          }}
          label="Enter manual connection details"
        />
        <div>
          <Button color="platinum" onClick={() => close()} type="button">
            Cancel
          </Button>
          <span className="server-address-form__submit">
            <Button type="submit" onClick={pairClickHandler} disabled={(isManualFormInvalid || !selectedServer)}>Send Pairing Request</Button>
          </span>
        </div>
      </div>
      <PairingCodeDialog
        show={showPairingCodeDialog}
        server={selectedServer}
        handleClose={() => setShowPairingCodeDialog(false)}
        handleSuccess={() => { setShowPairingCodeDialog(false); close(); }}
      />
    </Overlay>
  );
};

PairingOverlay.propTypes = {
};

PairingOverlay.defaultProps = {
};

function mapStateToProps(state) {
  return {
    show: !!state.ui.showPairingOverlay,
    isManualFormInvalid: isInvalid('server-address-form')(state),
  };
}

function mapDispatchToProps(dispatch) {
  return {
    close: () => dispatch(uiActions.update({ showPairingOverlay: false })),
    submitForm: () => dispatch(submit('server-address-form')),
    openDialog: dialogActions.openDialog,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(PairingOverlay);

export { PairingOverlay as UnconnectedPairingOverlay };

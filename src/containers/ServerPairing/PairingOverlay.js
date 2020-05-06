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
      console.log('auto pairing submitted');
    } else {
      // If we are in manual mode
      submitForm();
    }
  };

  const setServerFromFormValues = (values) => {
    console.log('settingserver', values);

    const server = addPairingUrlToService({
      addresses: [values.serverAddress],
      port: 51001, // Port is set statically, since it cannot be changed in server.
    });

    setSelectedServer(server);

    if (server.pairingServiceUrl) {
      // Now show the pairing key
      console.log('showing pairing key');
      setShowPairingCodeDialog(true);
    } else {
      openDialog({
        type: 'Error',
        error: 'Pairing request failed. An error occurred while attempting to pair.',
        confirmLabel: 'Okay',
      });
    }
  };

  return (
    <Overlay show={show} title="Pair with Server" onClose={() => close()}>
      <h2>Choose which Server to pair with</h2>
      <p>
        First, you much choose which computer running server you wish to pair this device
        with. Either select a computer that has been automatically discovered below, or enter
        manual connection details.
      </p>
      <Toggle
        input={{
          value: !autoPairingMode,
          onChange: () => {
            setAutoPairingMode(!autoPairingMode);
          },
        }}
        label="Enter manual connection details"
      />
      { autoPairingMode ? (
        <DiscoveredServerList
          selectHandler={setServerFromFormValues}
        />
      ) : (
        <ServerAddressForm
          submitHandler={setServerFromFormValues}
        />
      )}
      <div className="protocol-import--footer">
        <div>
          <Button color="platinum" onClick={() => close()} type="button">
            Cancel
          </Button>
          <span className="server-address-form__submit">
            <Button type="submit" onClick={pairClickHandler} disabled={(isManualFormInvalid)}>Send Pairing Request</Button>
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

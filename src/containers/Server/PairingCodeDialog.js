import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Button, Spinner } from '@codaco/ui';
import { PairingCodeLength } from 'secure-comms-api/pairingCodeConfig';
import ApiClient from '../../utils/ApiClient';
import { actionCreators as dialogActions } from '../../ducks/modules/dialogs';
import { actionCreators as pairedServerActions } from '../../ducks/modules/pairedServer';
import { Overlay } from '../Overlay';
import PairingCodeInput from './PairingCodeInput';

const initialState = {
  loading: false,
  pairingCode: null,
  pairingRequestSalt: null,
  pairingRequestId: null,
};

const PairingCodeDialog = (props) => {
  const {
    show,
    server,
    handleClose,
    handleSuccess,
    openDialog,
    setPairedServer,
    deviceName,
  } = props;

  const [{
    loading,
    pairingCode,
    pairingRequestSalt,
    pairingRequestId,
  }, setState,
  ] = useState(initialState);

  const [submittable, setSubmittable] = useState(true);

  let apiClient;

  const handleError = (error) => {
    openDialog({
      type: 'Error',
      error,
      confirmLabel: 'Okay',
      onConfirm: handleClose,
    });
  };

  const requestPairingCode = () => {
    setState(prevState => ({ ...prevState, loading: true }));
    apiClient.requestPairing()
      .then((data) => {
        if (!data) {
          // we aborted the request during unmount
          return;
        }

        setState(prevState => ({
          ...prevState,
          loading: false,
          pairingRequestSalt: data.salt,
          pairingRequestId: data.pairingRequestId,
        }));
      })
      .catch(err => handleError(err));
  };

  // Pairing step 2: derive a secret, send (encrypted) to server
  // At this point, we have a known connection to LAN server. 'loading' state would only distract.
  const confirmPairing = () => {
    apiClient.confirmPairing(pairingCode, pairingRequestId, pairingRequestSalt, deviceName)
      .then((pairingInfo) => {
        const device = pairingInfo.device;
        const server = addSecureApiUrlToServer({
          ...props.server,
          securePort: pairingInfo.securePort,
          sslCertificate: pairingInfo.sslCertificate,
        });
        setState({ ...initialState });
        setPairedServer(server, device.id, device.secret);
      })
      .then(() => handleSuccess())
      .catch(err => handleError(err));
  };

  const completePairing = (code) => {
    setState(prevState => ({
      ...prevState,
      pairingCode: code,
    }));

    confirmPairing();
  };

  useEffect(() => {
    if (server) {
      apiClient = new ApiClient(server.pairingServiceUrl);
      requestPairingCode();
    }

    return () => {
      if (apiClient) {
        apiClient.cancelAll();
      }
    };
  }, [server]);

  return (
    <Overlay title="Enter a Pairing Code" show={show} onClose={handleClose}>
      <form
        onSubmit={(evt) => {
          evt.preventDefault();
          // if (submittable) {
          //   document.activeElement.blur(); // attempt to hide soft keyboard on tablet
          //   this.setState({ submittable: false });

          // }
          // completePairing(pairingCode);
        }}
      >
        <p>
          You must pair this device with this Server before you can securely exchange data.
          This is a one-off process that allows your devices to identify each other.
        </p>
        {
          loading &&
          <React.Fragment>
            <strong>
              Please acknowledge the pairing request within the Server app to continue.
            </strong>
            <div className="pairing-form__loading">
              <Spinner small />
            </div>
          </React.Fragment>
        }

        { !loading &&
          <React.Fragment>
            <strong>
              Please type the code shown on the Server setup screen into the box below
            </strong>
            <fieldset className="pairing-form__fields">
              <PairingCodeInput
                charCount={PairingCodeLength}
                setPairingCode={completePairing}
                // ref={this.inputRef}
              />
              <div className="protocol-import--footer">
                <div>
                  <Button color="platinum" type="button" onClick={handleClose}>
                    Cancel
                  </Button>
                  <Button className="button button--primary pairing-form__submit" disabled={!submittable} type="submit">
                    Submit Pairing Code
                  </Button>
                </div>
                <a
                  // onClick={() => this.inputRef.current.clearForm()}
                  className="pairing-code-input__clear pairing-code-input__clear--small"
                >
                  Clear
                </a>
              </div>

            </fieldset>
          </React.Fragment>
        }
      </form>
    </Overlay>
  );
};

PairingCodeDialog.propTypes = {
  handleClose: PropTypes.func.isRequired,
  handleSuccess: PropTypes.func.isRequired,
};

PairingCodeDialog.defaultProps = {
  deviceName: '',
  onComplete: () => {},
  onError: () => {},
};

const mapStateToProps = state => ({
  // show: !!state.ui.showPairingCodeDialog,
  deviceName: state.deviceSettings.description,
});

const mapDispatchToProps = dispatch => ({
  openDialog: bindActionCreators(dialogActions.openDialog, dispatch),
  setPairedServer: bindActionCreators(pairedServerActions.setPairedServer, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(PairingCodeDialog);

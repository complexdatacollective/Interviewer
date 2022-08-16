/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { motion } from 'framer-motion';
import { Button, Spinner } from '@codaco/ui';
import { PairingCodeLength } from 'secure-comms-api/pairingCodeConfig';
import ApiClient from '../../utils/ApiClient';
import { actionCreators as dialogActions } from '../../ducks/modules/dialogs';
import { actionCreators as pairedServerActions } from '../../ducks/modules/pairedServer';
import PairingCodeInput from './PairingCodeInput';
import { addSecureApiUrlToServer } from '../../utils/serverAddressing';

const initialState = {
  loading: false,
  pairingCode: null,
  pairingRequestSalt: null,
  pairingRequestId: null,
  submittable: false,
};

const PairingCodeDialog = (props) => {
  const {
    server,
    handleCancel,
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
    submittable,
  }, setState,
  ] = useState(initialState);

  const inputRef = useRef();

  const apiClient = new ApiClient(server.pairingServiceUrl);

  const handleError = (error) => {
    openDialog({
      type: 'Error',
      error,
      confirmLabel: 'Okay',
      onConfirm: handleCancel,
    });
  };

  const setPairingCode = (currentCode) => {
    setState((prevState) => ({
      ...prevState,
      pairingCode: currentCode,
      submittable: currentCode.length === PairingCodeLength,
    }));
  };

  const requestPairingCode = () => {
    setState((prevState) => ({ ...prevState, loading: true }));
    apiClient.requestPairing()
      .then((data) => {
        if (!data) {
          // we aborted the request during unmount
          return;
        }

        setState((prevState) => ({
          ...prevState,
          loading: false,
          pairingRequestSalt: data.salt,
          pairingRequestId: data.pairingRequestId,
        }));
      })
      .catch((err) => handleError(err));
  };

  // Pairing step 2: derive a secret, send (encrypted) to server
  // At this point, we have a known connection to LAN server. 'loading' state would only distract.
  const confirmPairing = () => {
    apiClient.confirmPairing(pairingCode, pairingRequestId, pairingRequestSalt, deviceName)
      .then((pairingInfo) => {
        const { device } = pairingInfo;
        const pairedServer = addSecureApiUrlToServer({
          ...server,
          securePort: pairingInfo.securePort,
          sslCertificate: pairingInfo.sslCertificate,
        });
        setState({ ...initialState });
        setPairedServer(pairedServer, device.id, device.secret);
      })
      .then(() => handleSuccess())
      .catch((err) => handleError(err));
  };

  const completePairing = (code) => {
    setState((prevState) => ({
      ...prevState,
      pairingCode: code,
    }));

    confirmPairing();
  };

  useEffect(() => {
    requestPairingCode();

    return () => {
      if (apiClient) {
        apiClient.cancelAll();
      }
    };
  }, [server]);

  return (
    <motion.div className="pairing-content">
      {
        loading
          ? (
            <div className="pairing-form pairing-form--loading">
              <p>
                Please acknowledge the pairing request within the Server app to continue.
              </p>
              <div className="spinner-wrapper">
                <Spinner />
              </div>
            </div>
          )
          : (
            <div className="pairing-form pairing-form--code-entry">
              <p>
                Please type the code shown on the Server setup screen into the box below.
              </p>
              <form
                onSubmit={(evt) => {
                  evt.preventDefault();
                  if (submittable) {
                    document.activeElement.blur(); // attempt to hide soft keyboard on tablet
                    setState((prevState) => ({
                      ...prevState,
                      submittable: false,
                    }));
                  }
                  completePairing(pairingCode);
                }}
              >
                <fieldset className="pairing-form__fields">
                  <PairingCodeInput
                    charCount={PairingCodeLength}
                    setPairingCode={setPairingCode}
                    ref={inputRef}
                  />
                  <div className="pairing-form__footer">
                    <a
                      onClick={() => inputRef.current.clearForm()}
                      className="pairing-code-clear"
                    >
                      Clear
                    </a>
                    <div className="pairing-form-buttons">
                      <Button color="platinum" type="button" onClick={handleCancel}>
                        Cancel
                      </Button>
                      <Button className="button button--primary pairing-form__submit" disabled={!submittable} type="submit">
                        Submit Pairing Code
                      </Button>
                    </div>
                  </div>
                </fieldset>
              </form>
            </div>
          )
      }
    </motion.div>
  );
};

PairingCodeDialog.propTypes = {
  handleCancel: PropTypes.func.isRequired,
  handleSuccess: PropTypes.func.isRequired,
  deviceName: PropTypes.string,
};

PairingCodeDialog.defaultProps = {
  deviceName: '',
};

const mapStateToProps = (state) => ({
  deviceName: state.deviceSettings.description,
});

const mapDispatchToProps = (dispatch) => ({
  openDialog: bindActionCreators(dialogActions.openDialog, dispatch),
  setPairedServer: bindActionCreators(pairedServerActions.setPairedServer, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(PairingCodeDialog);

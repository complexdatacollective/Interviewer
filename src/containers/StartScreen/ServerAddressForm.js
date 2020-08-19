import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { isValid } from 'redux-form';
import { connect } from 'react-redux';
import { Button } from '@codaco/ui';
import { Form } from '../../containers/';
import { actionCreators as dialogActions } from '../../ducks/modules/dialogs';
import { isValidAddress, isValidPort, maxPort, minPort, addPairingUrlToService } from '../../utils/serverAddressing';
import { Overlay } from '../Overlay';
import PairingCodeDialog from '../Server/PairingCodeDialog';

const FORM_NAME = 'server-address-form';

const ServerAddressForm = ({
  show,
  handleClose,
  submittable,
  openDialog,
}) => {
  const [showPairingCodeDialog, setShowPairingCodeDialog] = useState(false);
  const [selectedServer, setSelectedServer] = useState(null);

  const handleSubmit = (values) => {
    console.log('settingserver', values);

    const serverWithPairingUrl = addPairingUrlToService({
      addresses: [values.serverAddress],
      port: values.serverPort,
    });

    setSelectedServer(serverWithPairingUrl);

    if (serverWithPairingUrl.pairingServiceUrl) {
      console.log('serverWithPairingURL', serverWithPairingUrl);
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

  const validateAddress = (address) => {
    if (!address) {
      return 'Please enter an IP address or domain name for Server.';
    }

    if (!isValidAddress(address)) {
      return 'Please enter a valid IP address or DNS name.';
    }

    return undefined;
  };

  const validatePort = (port) => {
    if (!port) {
      return 'Please enter a port number.';
    }

    if (!isValidPort(port)) {
      return `Please enter a valid port number (${minPort} - ${maxPort}).`;
    }

    if (port < minPort || port > maxPort) {
      return `Please enter a port in the range ${minPort} - ${maxPort}.`;
    }

    return undefined;
  };

  const formConfig = {
    formName: FORM_NAME,
    fields: [
      {
        label: 'Server Address',
        name: 'serverAddress',
        component: 'Text',
        placeholder: 'Enter an IP address or domain name...',
        validate: [validateAddress],
      },
      {
        label: 'Server Port',
        name: 'serverPort',
        component: 'Number',
        placeholder: 61001,
        validate: [validatePort],
      },
    ],
  };

  const initialValues = {
    serverPort: 61001,
  };

  return (
    <React.Fragment>
      <Overlay
        show={show}
        onClose={handleClose}
        title="Manual Server Connection"
      >
        <p>
          Enter the hostname or IP address of the computer running Server, and then
          click <strong>send pairing request</strong>. The computer you want to request
          pairing with must be reachable from this device using the details you provide.
        </p>
        <Form
          className="server-address-form"
          form={formConfig.formName}
          onSubmit={handleSubmit}
          formName="server-address-form"
          initialValues={initialValues}
          {...formConfig}
        >
          <div className="protocol-import--footer">
            <Button aria-label="Submit" type="submit" disabled={!submittable}>
              Send Pairing Request
            </Button>
          </div>
        </Form>
      </Overlay>
      <PairingCodeDialog
        show={showPairingCodeDialog}
        server={selectedServer}
        handleClose={() => setShowPairingCodeDialog(false)}
        handleSuccess={() => { setShowPairingCodeDialog(false); handleClose(); }}
      />
    </React.Fragment>
  );
};

ServerAddressForm.defaultProps = {
  show: false,
};

ServerAddressForm.propTypes = {
  handleClose: PropTypes.func.isRequired,
  show: PropTypes.bool,
};

const mapDispatchToProps = {
  openDialog: dialogActions.openDialog,
};

const mapStateToProps = state => ({
  submittable: isValid(FORM_NAME)(state),
});

export { ServerAddressForm };

export default connect(mapStateToProps, mapDispatchToProps)(ServerAddressForm);


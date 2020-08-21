import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { submit, isValid } from 'redux-form';
import { connect } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@codaco/ui';
import { Form } from '../../containers/';
import { actionCreators as dialogActions } from '../../ducks/modules/dialogs';
import { isValidAddress, isValidPort, maxPort, minPort, addPairingUrlToService } from '../../utils/serverAddressing';
import { Overlay } from '../Overlay';
import PairingCodeDialog from '../Server/PairingCodeDialog';
import { ExternalLink } from '../../components';

const FORM_NAME = 'server-address-form';

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

const ServerAddressForm = ({
  show,
  handleClose,
  submittable,
  openDialog,
  submitForm,
}) => {
  const [showPairingCodeDialog, setShowPairingCodeDialog] = useState(false);
  const [selectedServer, setSelectedServer] = useState(null);

  const handleSubmit = (values) => {
    const serverWithPairingUrl = addPairingUrlToService({
      addresses: [values.serverAddress],
      port: values.serverPort,
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
    serverPort: 51001,
    serverAddress: 'localhost',
  };

  const RenderPairingForm = () => (
    <motion.div layout className="server-address-form">
      <p>
        If you cannot use automatic Server discovery, you may still be able to pair
        this device with Server by manually entering connection details.
      </p>
      <p>
        Enter the hostname or IP address of the computer running Server, along with
        a port (either the default port, or a port you have opened through your firewall
        and redirected to Server) and then click <strong>send pairing request</strong>.
        The computer running Server must be reachable from this device using the details
        you provide.
      </p>
      <p>
        Visit our <ExternalLink href="https://documentation.networkcanvas.com/docs/key-concepts/pairing/">documentation article</ExternalLink> on pairing to learn more.
      </p>
      <Form
        className="server-address-form__form"
        form={formConfig.formName}
        onSubmit={handleSubmit}
        formName="server-address-form"
        initialValues={initialValues}
        {...formConfig}
      />
      <div className="server-address-form__footer">
        <Button aria-label="Submit" onClick={submitForm} disabled={!submittable}>
          Send Pairing Request
        </Button>
      </div>
    </motion.div>
  );

  const renderPairingCode = () => (
    <PairingCodeDialog
      show={showPairingCodeDialog}
      server={selectedServer}
      handleCancel={() => setShowPairingCodeDialog(false)}
      handleSuccess={() => { setShowPairingCodeDialog(false); handleClose(); }}
    />
  );

  return (
    <React.Fragment>
      <Overlay
        show={show}
        onClose={handleClose}
        title={(showPairingCodeDialog ? 'Pairing...' : 'Manual Server Connection')}
      >
        <AnimatePresence>
          { showPairingCodeDialog ? renderPairingCode() : RenderPairingForm()}
        </AnimatePresence>
      </Overlay>
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
  submitForm: () => submit(FORM_NAME),
};

const mapStateToProps = state => ({
  submittable: isValid(FORM_NAME)(state),
});

export { ServerAddressForm };

export default connect(mapStateToProps, mapDispatchToProps)(ServerAddressForm);


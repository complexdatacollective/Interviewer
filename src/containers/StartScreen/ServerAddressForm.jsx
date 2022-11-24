import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { submit, isValid } from 'redux-form';
import { connect } from 'react-redux';
import { motion } from 'framer-motion';
import { Button } from '@codaco/ui';
import Form from '../Form';
import { actionCreators as dialogActions } from '../../ducks/modules/dialogs';
import {
  isValidAddress, isValidPort, maxPort, minPort, addPairingUrlToService,
} from '../../utils/serverAddressing';
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
  server,
}) => {
  const [showPairingCodeDialog, setShowPairingCodeDialog] = useState(false);
  const [selectedServer, setSelectedServer] = useState(null);

  const handleSubmit = (values) => {
    const serverWithPairingUrl = addPairingUrlToService({
      host: values.serverAddress,
      addresses: [values.serverAddress],
      port: values.serverPort,
    });

    setSelectedServer(serverWithPairingUrl);
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

  const RenderPairingForm = () => (
    <motion.div layout className="server-address-form">
      <p>
        If you cannot use automatic Server discovery, you may still be able to pair
        this device with Server by manually entering connection details.
      </p>
      <p>
        Enter the hostname or IP address of the computer running Server, along with
        a port (either the default port, or a port you have opened through your firewall
        and redirected to Server) and then click
        {' '}
        <strong>send pairing request</strong>
        .
        The computer running Server must be reachable from this device using the details
        you provide.
      </p>
      <p>
        Visit our
        {' '}
        <ExternalLink href="https://documentation.networkcanvas.com/key-concepts/pairing/">documentation article</ExternalLink>
        {' '}
        on pairing to learn more.
      </p>
      <Form
        className="server-address-form__form"
        form={formConfig.formName}
        onSubmit={handleSubmit}
        formName="server-address-form"
        initialValues={initialValues}
        {...formConfig} // eslint-disable-line react/jsx-props-no-spreading
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

  useEffect(() => {
    // This component is passed a server object when triggered by clicking a ServerCard
    // If the server prop is set, use it.
    if (server) {
      setSelectedServer(server);
    }

    if (selectedServer && !selectedServer.pairingServiceUrl) {
      openDialog({
        type: 'Error',
        error: 'Pairing request failed. An error occurred while attempting to send the pairing request.',
        confirmLabel: 'Okay',
      });

      return;
    }

    if (selectedServer) {
      // We have a selectedServer with a pairingServiceUrl
      // Now show the pairing key dialog
      setShowPairingCodeDialog(true);
    }
  }, [server, selectedServer]);

  return (
    <>
      <Overlay
        show={show}
        onClose={handleClose}
        title={(showPairingCodeDialog ? 'Pairing...' : 'Manual Server Connection')}
      >
        { showPairingCodeDialog ? renderPairingCode() : RenderPairingForm()}
      </Overlay>
    </>
  );
};

ServerAddressForm.defaultProps = {
  show: false,
  server: null,
};

ServerAddressForm.propTypes = {
  handleClose: PropTypes.func.isRequired,
  show: PropTypes.bool,
  server: PropTypes.object,
};

const mapDispatchToProps = {
  openDialog: dialogActions.openDialog,
  submitForm: () => submit(FORM_NAME),
};

const mapStateToProps = (state) => ({
  submittable: isValid(FORM_NAME)(state),
});

export { ServerAddressForm };

export default connect(mapStateToProps, mapDispatchToProps)(ServerAddressForm);

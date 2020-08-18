import React from 'react';
import PropTypes from 'prop-types';
import { Form } from '../../containers/';
import { isValidAddress, isValidPort, maxPort, minPort } from '../../utils/serverAddressing';

const ServerAddressForm = (props) => {
  const {
    submitHandler,
  } = props;

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

  return (
    <div>
      <h4>Enter manual connection information</h4>
      <Form
        className="server-address-form"
        form="server-address-form"
        onSubmit={submitHandler}
        formName="server-address-form"
        fields={[
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
        ]}
        initialValues={{
          serverPort: 25,
        }}
      />
    </div>
  );
};

ServerAddressForm.defaultProps = {
};

ServerAddressForm.propTypes = {
  submitHandler: PropTypes.func.isRequired,
};

export default ServerAddressForm;

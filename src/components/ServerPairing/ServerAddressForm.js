import React from 'react';
import PropTypes from 'prop-types';
import { Form } from '../../containers/';
import { isValidAddress } from '../../utils/serverAddressing';

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

  return (
    <div>
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
        ]}
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

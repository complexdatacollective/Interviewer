import React, { Component } from 'react';
import PropTypes from 'prop-types';

import PairingCodeInput from './PairingCodeInput';
import { Button } from '../../ui/components';

// TODO: Share with Server
const charCount = 12;

class ServerPairingForm extends Component {
  constructor(props) {
    super(props);
    this.state = { pairingCode: '' };
  }

  setPairingCode = (pairingCode) => {
    this.setState({
      pairingCode,
      submittable: pairingCode.length === charCount,
    });
  }

  render() {
    const { completePairing, disabled, ...props } = this.props;
    const { submittable } = this.state;
    return (
      <form
        className="pairing-form"
        onSubmit={(evt) => {
          evt.preventDefault();
          completePairing(this.state.pairingCode);
        }}
        {...props}
      >
        <h1>Pairing</h1>
        <p>
          You must pair this device with this instance of Server. This is a one-off process that
          allows your devices to securely identify each other.
        </p>
        <p>Please type the number shown on the Server setup screen into the box below.</p>

        <fieldset className="pairing-form__fields">
          <PairingCodeInput
            charCount={charCount}
            disabled={disabled}
            setPairingCode={this.setPairingCode}
          />

          <div className="pairing-form__submit">
            <Button disabled={disabled || !submittable} size="small">
              Pair
            </Button>
          </div>
        </fieldset>
      </form>
    );
  }
}

ServerPairingForm.defaultProps = {
  disabled: false,
};

ServerPairingForm.propTypes = {
  completePairing: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

export default ServerPairingForm;

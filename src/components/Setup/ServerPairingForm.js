import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Button } from '../../ui/components';

class ServerPairingForm extends Component {
  constructor(props) {
    super(props);
    this.state = { pairingCode: '' };
  }

  onPairingInputChange = (evt) => {
    this.setState({ pairingCode: evt.target.value });
  }

  render() {
    const { completePairing, disabled, ...props } = this.props;
    return (
      <form className="pairing-form" onSubmit={() => completePairing(this.state.pairingCode)} {...props}>
        <h1>Pairing</h1>
        <p>
          You must pair this device with this instance of Server. This is a one-off process that
          allows your devices to securely identify each other.
        </p>
        <p>Please type the number shown on the Server setup screen into the box below.</p>

        <input
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          className="pairing-form__input"
          disabled={disabled}
          type="text"
          value={this.state.pairingCode}
          onChange={this.onPairingInputChange}
        />

        <Button disabled={disabled} size="small">
          Pair
        </Button>
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

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import PairingCodeInput from './PairingCodeInput';
import { Button, Spinner } from '../../ui/components';
import { PairingCodeLength } from '../../utils/shared-api/pairingCodeConfig';

class ServerPairingForm extends Component {
  constructor(props) {
    super(props);
    this.state = { pairingCode: '' };
  }

  setPairingCode = (pairingCode) => {
    this.setState({
      pairingCode,
      submittable: pairingCode.length === PairingCodeLength,
    });
  }

  render() {
    const { className, completePairing, loading, ...props } = this.props;
    const { submittable } = this.state;
    return (
      <form
        className={`pairing-form ${className}`}
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

        {
          loading &&
          <React.Fragment>
            <p>Please acknowledge the pairing request on the Server...</p>
            <div className="pairing-form__loading">
              <Spinner />
            </div>
          </React.Fragment>
        }

        { !loading &&
          <React.Fragment>
            <p>Please type the number shown on the Server setup screen into the box below.</p>
            <fieldset className="pairing-form__fields">
              <PairingCodeInput
                charCount={PairingCodeLength}
                setPairingCode={this.setPairingCode}
              />

              <div className="pairing-form__submit">
                <Button disabled={!submittable} size="small">
                  Pair
                </Button>
              </div>
            </fieldset>
          </React.Fragment>
        }
      </form>
    );
  }
}

ServerPairingForm.defaultProps = {
  className: '',
  loading: false,
};

ServerPairingForm.propTypes = {
  className: PropTypes.string,
  completePairing: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};

export default ServerPairingForm;

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { PairingCodeLength } from 'secure-comms-api/pairingCodeConfig';

import PairingCodeInput from './PairingCodeInput';
import { Button, Spinner } from '../../ui/components';

/**
 * @class Renders a form for user to enter the out-of-band pairing code presented by Server.
 */
class ServerPairingForm extends Component {
  constructor(props) {
    super(props);
    this.state = { pairingCode: '' };

    this.inputRef = React.createRef();
  }

  setPairingCode = (pairingCode) => {
    this.setState({
      pairingCode,
      submittable: pairingCode.length === PairingCodeLength,
    });
  }

  render() {
    const { className, completePairing, loading, onCancel, ...props } = this.props;
    const { submittable } = this.state;
    return (
      <form
        className={`pairing-form ${className}`}
        onSubmit={(evt) => {
          evt.preventDefault();
          if (submittable) {
            document.activeElement.blur(); // attempt to hide soft keyboard on tablet
            this.setState({ submittable: false });
            completePairing(this.state.pairingCode);
          }
        }}
        {...props}
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
                setPairingCode={this.setPairingCode}
                ref={this.inputRef}
              />
              <div className="protocol-import--footer">
                <div>
                  <Button color="platinum" type="button" onClick={onCancel}>
                    Cancel
                  </Button>
                  <Button className="button button--primary pairing-form__submit" disabled={!submittable} type="submit">
                    Pair
                  </Button>
                </div>
                <a
                  onClick={() => this.inputRef.current.clearForm()}
                  className="pairing-code-input__clear pairing-code-input__clear--small"
                >
                  Clear
                </a>
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
  onCancel: PropTypes.func.isRequired,
};

export default ServerPairingForm;

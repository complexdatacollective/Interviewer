import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import { addApiUrlToService, apiProtocol, isValidAddress, isValidPort, maxPort, minPort } from '../../utils/serverAddressing';
import { Button, Icon } from '../../ui/components';

class ServerAddressForm extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      error: {},
      address: '',
      port: '',
    };
  }

  onSubmit = (evt) => {
    evt.preventDefault();
    const server = addApiUrlToService({
      addresses: [this.state.address],
      port: this.state.port,
    });
    if (server.apiUrl) {
      this.props.selectServer(server);
    }
  }

  setAddress(address) {
    this.setState({ address });
  }

  setPort(port) {
    this.setState({ port });
  }

  validateAddress(address) {
    const addressError = { address: address && !isValidAddress(address) };
    this.setState({ error: { ...this.state.error, ...addressError } });
  }

  validatePort(port) {
    // Currently requires port number.
    // If port is not required, then be careful of input containing '+', '-', and 'e',
    // which are valid characters in a number field (and will be displayed), but may return
    // (in target.value) as '' if they don't form a number.
    const portError = { port: !isValidPort(port) };
    this.setState({ error: { ...this.state.error, ...portError } });
  }

  clearError(name) {
    const clearedError = { [name]: null };
    this.setState({ error: { ...this.state.error, ...clearedError } });
  }

  render() {
    const { cancel } = this.props;
    const { error } = this.state;
    const inputClass = 'server-address-form__input';
    const addrClass = error.address ? `${inputClass} ${inputClass}--error` : inputClass;
    const portClass = error.port ? `${inputClass} ${inputClass}--error` : inputClass;

    return (
      <form className="server-address-form" onSubmit={this.onSubmit}>
        <h2>Server Connection</h2>
        <p>
          Enter the address and port number of your running Server instance.
          The local network IP and port number can be found on your Server’s overview screen.
        </p>
        <fieldset className="server-address-form__fields">
          <div className="server-address-form__field">
            <p className="server-address-form__text">{apiProtocol}://</p>
          </div>
          <div className="server-address-form__field">
            <input
              type="text"
              autoComplete="off"
              autoCorrect="off"
              className={addrClass}
              id="server-address-form-input-ip"
              placeholder="192.168.99.99"
              value={this.state.address}
              onChange={evt => this.setAddress(evt.target.value)}
              onFocus={() => this.clearError('address')}
              onBlur={evt => this.validateAddress(evt.target.value)}
            />
            <label className="server-address-form__label" htmlFor="server-address-form-input-ip">
              Address
            </label>
          </div>
          <div className="server-address-form__field">
            <p className="server-address-form__text">:</p>
          </div>
          <div className="server-address-form__field">
            <input
              className={portClass}
              id="server-address-form-input-port"
              autoComplete="off"
              autoCorrect="off"
              max={maxPort}
              min={minPort}
              type="number"
              placeholder="51001"
              size="5"
              value={this.state.port}
              onChange={evt => this.setPort(evt.target.value)}
              onFocus={() => this.clearError('port')}
              onBlur={evt => this.validatePort(evt.target.value)}
            />
            <label className="server-address-form__label" htmlFor="server-address-form-input-port">
              Port
            </label>
          </div>
        </fieldset>
        {
          cancel &&
          <a onClick={() => cancel()} className="server-address-form__cancel server-address-form__cancel--small">
            <Icon name="close" className="server-address-form__cancel-button" />
            Cancel
          </a>
        }
        <span className="server-address-form__submit">
          <Button size="small" content="Pair" />
        </span>
      </form>
    );
  }
}

ServerAddressForm.defaultProps = {
  cancel: null,
};

ServerAddressForm.propTypes = {
  cancel: PropTypes.func.isRequired,
  selectServer: PropTypes.func.isRequired,
};

export default ServerAddressForm;

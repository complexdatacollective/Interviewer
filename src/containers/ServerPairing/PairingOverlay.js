import React, { useState } from 'react';
import { connect } from 'react-redux';
import { Button } from '@codaco/ui';
import { Toggle, Text, Number } from '@codaco/ui/lib/components/Fields';
import { actionCreators as uiActions } from '../../ducks/modules/ui';
import { Overlay } from '../Overlay';
import { DiscoveredServerList, ServerAddressForm } from '../../components/SetupScreen';
import ServerPairingDialog from './ServerPairingDialog';
import { addPairingUrlToService, isValidAddress, isValidPort, maxPort, minPort } from '../../utils/serverAddressing';
import { Form } from '..';

const PairingOverlay = (props) => {
  const {
    show,
    close,
  } = props;

  const [selectedServer, setSelectedServer] = useState(null);
  const [serverAddress, setServerAddress] = useState('');
  const [serverPort, setServerPort] = useState(51001);

  const [autoPairingMode, setAutoPairingMode] = useState(true);

  const renderManualForm = () => {

    const validateAddress = (address) => {
      const addressError = { address: address && !isValidAddress(address) };
      this.setState({ error: { ...this.state.error, ...addressError } });
    };

    const required = value => value ? undefined : 'Required'
    const maxLength = max => value =>
      value && value.length > max ? `Must be ${max} characters or less` : undefined
    const maxLength15 = maxLength(15)

    const onSubmit = (evt) => {
      evt.preventDefault();
      const server = addPairingUrlToService({
        addresses: [this.state.address],
        port: this.state.port,
      });
      if (server.pairingServiceUrl) {
        this.props.selectServer(server);
        this.props.onCancel();
      } else {
        this.setState({
          error: {
            address: !isValidAddress(this.state.address),
            port: !isValidPort(this.state.port),
          },
        });
      }
    };

    return (
      <div>
        <h4>Enter manual connection information</h4>
        <Form
          className="server-address-form"
          form="server-address-form"
          onSubmit={e => console.log('yoo', e)}
          formName="server-address-form"
          fields={[
            {
              label: 'Server Address',
              name: 'serverAddress',
              component: 'Text',
              placeholder: 'Enter an IP address or domain name...',
              validate: [required, maxLength15],
            },
            {
              label: 'Server Port',
              name: 'serverPort',
              component: 'Number',
              placeholder: '5101',
              validation: {
                required: true,
                maxLength: 20,
              },
            },
          ]}
        />
      </div>
    );
  };

  // const pairClickHandler = () => {
  //   const server = addPairingUrlToService({
  //     addresses: [this.state.address],
  //     port: this.state.port,
  //   });

  //   if (autoPairingMode) {

  //   } else {
  //     // If we are in manual mode

  //   }

  // }

  return (
    <Overlay show={show} title="Pair with Server" onClose={() => close()}>
      <h2>Step 1: Choose which Server to pair with</h2>
      <p>
        First, you much choose which computer running server you wish to pair this device
        with. Either select a computer that has been automatically discovered below, or enter
        manual connection details.
      </p>
      { autoPairingMode ? (
        <DiscoveredServerList selectServer={setSelectedServer} />
      ) : (
        // <ServerAddressForm
        //   selectServer={setSelectedServer}
        //   onCancel={() => console.log('server address form: onCancel()')}
        // />
        renderManualForm()
      )}
      <div className="protocol-import--footer">
        <Toggle
          input={{
            value: !autoPairingMode,
            onChange: () => {
              setAutoPairingMode(!autoPairingMode);
            },
          }}
          label="Enter manual connection details"
        />
        <div>
          <Button color="platinum" onClick={() => onCancel()} type="button">
            Cancel
          </Button>
          <span className="server-address-form__submit">
            <Button content="Pair" type="submit" onClick={() => console.log('main click')} />
          </span>
        </div>
      </div>
      <ServerPairingDialog server={selectedServer} />
    </Overlay>
  );
};

PairingOverlay.propTypes = {
};

PairingOverlay.defaultProps = {
};

function mapStateToProps(state) {
  return {
    show: !!state.ui.showPairingOverlay,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    close: () => dispatch(uiActions.update({ showPairingOverlay: false })),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(PairingOverlay);

export { PairingOverlay as UnconnectedPairingOverlay };

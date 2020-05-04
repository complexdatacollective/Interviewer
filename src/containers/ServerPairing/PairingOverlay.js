import React, { useState } from 'react';
import { connect } from 'react-redux';
import { Toggle } from '@codaco/ui/lib/components/Fields';
import { actionCreators as uiActions } from '../../ducks/modules/ui';
import { Overlay } from '../Overlay';
import { DiscoveredServerList, ServerAddressForm } from '../../components/SetupScreen';
import ServerPairingDialog from './ServerPairingDialog';

const PairingOverlay = (props) => {
  const {
    show,
    close,
  } = props;

  const [selectedServer, setSelectedServer] = useState(null);
  const [autoPairingMode, setAutoPairingMode] = useState(true);

  console.log('pairingoverlay', selectedServer);

  return (
    <Overlay show={show} title="Pair with Server" onClose={() => close()}>
      <Toggle
        input={{
          value: !autoPairingMode,
          onChange: () => {
            setAutoPairingMode(!autoPairingMode);
          },
        }}
        label="Enter manual connection details"
        fieldLabel=" "
      />
      { autoPairingMode ? (
        <DiscoveredServerList selectServer={setSelectedServer} />
      ) : (
        <ServerAddressForm
          selectServer={setSelectedServer}
          onCancel={() => console.log('server address form: onCancel()')}
        />
      )}
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

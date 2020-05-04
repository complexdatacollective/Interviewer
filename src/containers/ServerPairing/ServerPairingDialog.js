import React from 'react';
import { connect } from 'react-redux';
import { actionCreators as uiActions } from '../../ducks/modules/ui';
import { Overlay } from '../Overlay';
import ServerPairing from './ServerPairing';


const ServerPairingDialog = (props) => {
  const {
    show,
    close,
    server,
  } = props;

  return (
    <Overlay title="ServerPairingDialog" show={show}>
      <ServerPairing
        server={server}
        onComplete={() => console.log('serverPairing on pairing complete')}
        onError={() => console.log('serverPairing: on pairing error')}
        onCancel={() => close()}
      />
    </Overlay>
  );
};

ServerPairingDialog.propTypes = {
};

ServerPairingDialog.defaultProps = {
};

function mapStateToProps(state) {
  return {
    show: !!state.ui.showServerPairingDialog,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    close: () => dispatch(uiActions.update({ showServerPairingDialog: false })),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ServerPairingDialog);

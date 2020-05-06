import React, { useState } from 'react';
import { connect } from 'react-redux';
import { actionCreators as uiActions } from '../../ducks/modules/ui';
import { Overlay } from '../Overlay';
import ServerProtocols from './ServerProtocols';

const ServerProtocolsOverlay = (props) => {
  const {
    show,
    close,
  } = props;

  return (
    <Overlay show={show} title="Import Protocols from Server" onClose={() => close()}>
      <p>
        Click one or more protocols to import them from Server.
      </p>
      <ServerProtocols />
    </Overlay>
  );
};

ServerProtocolsOverlay.propTypes = {
};

ServerProtocolsOverlay.defaultProps = {
};

function mapStateToProps(state) {
  return {
    show: !!state.ui.showServerProtocolsOverlay,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    close: () => dispatch(uiActions.update({ showServerProtocolsOverlay: false })),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ServerProtocolsOverlay);

export { ServerProtocolsOverlay as UnconnectedServerProtocolsOverlay };

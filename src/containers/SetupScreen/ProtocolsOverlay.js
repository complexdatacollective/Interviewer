import React from 'react';
import { connect } from 'react-redux';
import { actionCreators as uiActions } from '../../ducks/modules/ui';
import { ProtocolList } from '.';
import { Overlay } from '../Overlay';

const ProtocolsOverlay = (props) => {
  const {
    show,
    close,
  } = props;

  return (
    <Overlay show={show} title="Protocol Library" onClose={() => close()}>
      {/* <div>
        Some introductory text can go here that explains you can drag a protocol into this window to import it, or else you can use the import buttons.
      </div> */}
      <ProtocolList />
    </Overlay>
  );
};

ProtocolsOverlay.propTypes = {
};

ProtocolsOverlay.defaultProps = {
};

function mapStateToProps(state) {
  return {
    show: !!state.ui.showProtocolsOverlay,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    close: () => dispatch(uiActions.update({ showProtocolsOverlay: false })),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ProtocolsOverlay);

export { ProtocolsOverlay as UnconnectedProtocolsOverlay };

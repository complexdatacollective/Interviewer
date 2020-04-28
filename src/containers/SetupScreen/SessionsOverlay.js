import React from 'react';
import { connect } from 'react-redux';
import { actionCreators as uiActions } from '../../ducks/modules/ui';
import { SessionList } from '.';
import { Overlay } from '../Overlay';

const SessionsOverlay = (props) => {
  const {
    show,
    close,
  } = props;

  return (
    <Overlay show={show} title="Interview Sessions" onClose={() => close()}>
      {/* <div>
        Some introductory text about interview sessions.
      </div> */}
      <SessionList />
    </Overlay>
  );
};

SessionsOverlay.propTypes = {
};

SessionsOverlay.defaultProps = {
};

function mapStateToProps(state) {
  return {
    show: !!state.ui.showSessionsOverlay,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    close: () => dispatch(uiActions.update({ showSessionsOverlay: false })),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(SessionsOverlay);

export { SessionsOverlay as UnconnectedSessionsOverlay };

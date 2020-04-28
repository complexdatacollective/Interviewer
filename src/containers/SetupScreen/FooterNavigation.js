import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Icon } from '@codaco/ui';
import { actionCreators as uiActions } from '../../ducks/modules/ui';

const FooterNavigation = (props) => {
  // const {
  // } = props;
  return (
    <footer className="setup-screen__footer">
      <section className="footer-section">
        <Icon name="settings" />
        <h4 className="footer-section__label">Settings</h4>
      </section>
      <section className="footer-section">
        <Icon name="menu-sociogram" />
        <h4 className="footer-section__label">Interview Sessions</h4>
      </section>
      <section className="footer-section">
        <Icon name="menu-default-interface" />
        <h4 className="footer-section__label">Protocol Library</h4>
      </section>
      <section className="footer-section">
        <Icon name="menu-download-data" />
        <h4 className="footer-section__label">Export Data</h4>
      </section>
    </footer>
  );
};

FooterNavigation.propTypes = {
};

FooterNavigation.defaultProps = {
};

function mapStateToProps(state) {
  return {
    isSessionActive: !!state.activeSessionId,
    sessions: state.sessions,
    sessionId: state.activeSessionId,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    setShowImportProtocolOverlay: status =>
      dispatch(uiActions.update({ showImportProtocolOverlay: status })),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(FooterNavigation);

export { FooterNavigation as UnconnectedFooterNavigation };

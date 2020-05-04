import React from 'react';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import { Button } from '@codaco/ui';
import { actionCreators as uiActions } from '../../ducks/modules/ui';
import { isIOS } from '../../utils/Environment';
import ServerStatusIcon from '../ServerPairing/ServerStatusIcon';
import NCLogo from '../../images/NC-Logo.svg';
import NCLogoBeta from '../../images/NC-Logo-beta.svg';
import {
  ResumeSessionSection,
  NewInterviewSection,
  FooterNavigation,
  ProtocolsOverlay,
  SessionsOverlay,
} from '.';
import { Scroller } from '../../components';

const SetupScreen = (props) => {
  const {
    sessions,
    isSessionActive,
    sessionId,
  } = props;

  // If we have an active session, don't render this component. Redirect to
  // the session route.
  if (isSessionActive) {
    const stageIndex = sessions[sessionId].stageIndex;
    const pathname = `/session/${sessionId}/${stageIndex}`;
    return (<Redirect to={{ pathname: `${pathname}` }} />);
  }

  return (
    <React.Fragment>
      <div className="bg bg-1" />
      <ServerStatusIcon />
      <ProtocolsOverlay />
      <SessionsOverlay />
      {/* <ExportOverlay /> */}
      <div className="setup-screen">
        <header className="setup-screen__header">
          <img src={isIOS() ? NCLogo : NCLogoBeta} className="header-logo" alt="Network Canvas" />
        </header>
        <Scroller className="setup-screen__main">

          {/* <section className="setup-section welcome-section">
            <header>
              <h1>Welcome to Network Canvas</h1>
            </header>
            <main>
              <p>
                This is an example of the size of some text that can be used for reference
                purposes.
              </p>
            </main>
          </section> */}
          <NewInterviewSection />
          <ResumeSessionSection />
          <section className="setup-section import-section">
            <main className="section-wrapper">
              <section className="setup-section__content import-section__content">
                <header>
                  <h1>Import a Protocol</h1>
                  <h3>Choose Location</h3>
                </header>
                <div className="import-content">
                  <div className="device-card">
                    <Button>Browse your device...</Button>
                  </div>
                  <div className="url-card">
                    <Button>Enter a URL...</Button>
                  </div>
                  <div className="server-import-card">
                    <Button>From Server...</Button>
                  </div>
                </div>
              </section>
            </main>
          </section>
          <section className="setup-section export-section">
            <main className="section-wrapper">
              <section className="setup-section__content export-section__content">
                <header>
                  <h1>Export Data</h1>
                  <h3>Quick Export</h3>
                </header>
                <div className="export-content">
                  <div className="unexported-file-card">
                    <h3>Export 12 New Sessions to Files...</h3>
                  </div>
                  <div className="unexported-server-card">
                    <h3>Export 12 New Sessions to Server...</h3>
                  </div>
                </div>
              </section>
              <aside className="setup-section__action export-section__action">
                <div className="export-action">
                  <h4>Select sessions to export</h4>
                  <div className="select-sessions-card">
                    <h3>Open Session List...</h3>
                  </div>
                </div>
                <div className="export-action">
                  <h4>Change Export Settings</h4>
                  <div className="export-settings-card">
                    <h3>Open Export Settings...</h3>
                  </div>
                </div>
              </aside>
            </main>
          </section>
        </Scroller>
        <FooterNavigation />
      </div>
    </React.Fragment>
  );
};

SetupScreen.propTypes = {
};

SetupScreen.defaultProps = {
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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(SetupScreen));

export { SetupScreen as UnconnectedSetupScreen };

import React from 'react';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import { actionCreators as uiActions } from '../../ducks/modules/ui';
import { isIOS } from '../../utils/Environment';
import NCLogo from '../../images/NC-Logo.svg';
import NCLogoBeta from '../../images/NC-Logo-beta.svg';
import serverLogo from '../../images/Srv-Flat.svg';
import {
  ResumeSessionSection,
  NewInterviewSection,
  FooterNavigation,
  ProtocolsOverlay,
  ExportOverlay,
  SessionsOverlay,
} from '.';

const ServerStatus = () => (
  <img src={serverLogo} className="server-status" alt="Server Status" />
);

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
      <ServerStatus />
      <ProtocolsOverlay />
      <SessionsOverlay />
      {/* <ExportOverlay /> */}
      <div className="setup-screen">
        <header className="setup-screen__header">
          <img src={isIOS() ? NCLogo : NCLogoBeta} className="header-logo" alt="Network Canvas" />
        </header>
        <main className="setup-screen__main scrollable">
          {/* <ToggleSessionListButton sessionListShown={showSessionList} /> */}
          {/* <ImportProtocolButton /> */}
          {/* <ProtocolList /> */}
          {/* <SessionList /> */}

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
            <header className="section-header">
              <h2>Import Protocol</h2>
            </header>
            <main className="section-wrapper">
              <section className="setup-section__content">
                <header>
                  <h3>From File</h3>
                </header>
                <div className="device-card">
                  <h4>Browse your device...</h4>
                </div>
              </section>
              <section className="setup-section__content">
                <header>
                  <h3>From URL</h3>
                </header>
                <div className="url-card">
                  <h4>Enter a URL...</h4>
                </div>
              </section>
              <section className="setup-section__content">
                <header>
                  <h3>From Server</h3>
                </header>
                <div className="server-import-card">
                  <h4>View Server Protocols...</h4>
                </div>
              </section>
            </main>
          </section>
          <section className="setup-section export-section">
            <header className="section-header">
              <h2>Export Data</h2>
            </header>
            <main className="section-wrapper">
              <section className="setup-section__content">
                <header>
                  <h3>All Unexported</h3>
                </header>
                <div className="unexported-card">
                  <h4>+12 Unexported Sessions...</h4>
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
        </main>
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

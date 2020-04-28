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

          <section className="setup-section export-section">
            <header className="section-header">
              <h1>Export Data</h1>
            </header>
            <main className="section-wrapper">
              <section className="setup-section__content">
                <header>
                  <h2>All Unexported</h2>
                </header>
                <div className="resume-card">
                  <h2>+12 Sessions...</h2>
                </div>
              </section>
              <section className="setup-section__content">
                <header>
                  <h2>Select sessions to export</h2>
                </header>
                <div className="resume-card">
                  <h2>Select Sessions</h2>
                </div>
              </section>
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

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';
import { get } from 'lodash';
import { Redirect } from 'react-router-dom';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import cx from 'classnames';
import { Icon } from '@codaco/ui';
import { actionCreators as uiActions } from '../../ducks/modules/ui';
import { isIOS } from '../../utils/Environment';
import NCLogo from '../../images/NC-Logo.svg';
import NCLogoBeta from '../../images/NC-Logo-beta.svg';
import serverLogo from '../../images/Srv-Flat.svg';
import downArrow from '../../images/down-arrow.svg';
import SettingsMenuButton from '../../components/SettingsMenu/SettingsMenuButton';
import { ProtocolList, SessionList } from '.';

const ServerStatus = () => (
  <img src={serverLogo} className="server-status" alt="Server Status" />
);

const ImportProtocolButton = () => {
  return (
    <React.Fragment>
      <Icon
        name="add-a-protocol"
        className="setup__server-button"
        onClick={() => setShowImportProtocolOverlay(true)}
      />
    </React.Fragment>
  );
};

const SetupScreen = (props) => {
  const {
    sessions,
    isSessionActive,
    sessionId,
  } = props;

  const [showSessionList, setShowSessionList] = useState(false);

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
      {/* <SettingsMenuButton /> */}
      <ServerStatus />
      <div className="setup-screen">
        <header className="setup-screen__header">
          <img src={isIOS() ? NCLogo : NCLogoBeta} className="header-logo" alt="Network Canvas" />
        </header>
        <main className="setup-screen__main scrollable">
          {/* <ToggleSessionListButton sessionListShown={showSessionList} /> */}
          {/* <ImportProtocolButton /> */}
          {/* <ProtocolList /> */}
          {/* <SessionList /> */}

          <section className="setup-section welcome-section">
            <heading>
              <h1>Welcome to Network Canvas</h1>
            </heading>
            <main>
              <p>
                This is an example of the size of some text that can be used for reference
                purposes.
              </p>
            </main>
          </section>
          <section className="setup-section start-section">
            <main className="setup-section__content">
              <heading>
                <h2>Start a new Interview</h2>
              </heading>
              <article className="start-section__protocol-card start-section__protocol-card--main">
                <div className="card-content">
                  <h1>Development Protocol</h1>
                  <small>March 4th 2020, 19:26</small>
                  <h4>Development Protocol</h4>
                </div>
                <div className="card-action">
                  <Icon name="arrow-right" />
                </div>
              </article>
            </main>
            <aside className="setup-section__action">
              <h4>Resume Other Session</h4>
              <div className="start-section__protocol-card start-section__protocol-card--others">
                <h2>+12 Others...</h2>
              </div>
            </aside>
          </section>
          <section className="setup-section resume-section">
            <main className="setup-section__content">
              <heading>
                <h2>Resume Last Session</h2>
              </heading>
              <article className="resume-section__session-card resume-section__session-card--main">
                <div className="card-content">
                  <h1>Joshua Melville</h1>
                  <small>March 4th 2020, 19:26</small>
                  <h4>Development Protocol</h4>
                </div>
                <div className="card-action">
                  <Icon name="arrow-right" />
                </div>
              </article>
            </main>
            <aside className="setup-section__action">
              <h4>Resume Other Session</h4>
              <div className="resume-section__session-card resume-section__session-card--others">
                <h2>+12 Others...</h2>
              </div>
            </aside>
          </section>
          <section className="setup-section">
            <heading>
              <h1>Export Data</h1>
            </heading>
          </section>
        </main>
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
          <section className="footer-section" >
            <Icon name="info" />
            <h4 className="footer-section__label">Help</h4>
          </section>
        </footer>
      </div>
    </React.Fragment>
  );
};

SetupScreen.propTypes = {
  sessions: PropTypes.object.isRequired,
  sessionId: PropTypes.string,
  isSessionActive: PropTypes.bool.isRequired,
};

SetupScreen.defaultProps = {
  isPairedWithServer: false,
  sessionId: null,
};

function mapStateToProps(state) {
  return {
    isSessionActive: !!state.activeSessionId,
    isPairedWithServer: !!state.pairedServer,
    protocolUID: get(state.sessions[state.activeSessionId], 'protocolUID'),
    sessionId: state.activeSessionId,
    sessions: state.sessions,
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

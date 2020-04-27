import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';
import { get } from 'lodash';
import { Redirect } from 'react-router-dom';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import cx from 'classnames';
import { Icon, Button } from '@codaco/ui';
import { actionCreators as uiActions } from '../../ducks/modules/ui';
import { isIOS } from '../../utils/Environment';
import NCLogo from '../../images/NC-Logo.svg';
import NCLogoBeta from '../../images/NC-Logo-beta.svg';
import serverLogo from '../../images/Srv-Flat.svg';
import downArrow from '../../images/down-arrow.svg';
import SettingsMenuButton from '../../components/SettingsMenu/SettingsMenuButton';
import { ProtocolList, SessionList } from '.';
import { ProtocolCard } from '../../components/SetupScreen';
import { SessionCard } from '../../components';

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

  const testingProtocol = {
    name: 'Development Protocol',
    uuid: '2342-234234-2323-23423',
    description: 'Something about the protocol should go here.',
    schemaVersion: 2,
  };

  const testSession = {
    caseId: 'Joshua Melville',
    protocolUID: '2bfdc64c-5753-4539-bf18-f5b007169911',
    progress: 35,
    updatedAt: 1587545990894,
    lastExportedAt: 1587545990894,
  };

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
            <heading className="section-heading">
              <h1>Start a new Interview</h1>
            </heading>
            <main className="section-wrapper">
              <section className="setup-section__content">
                <heading>
                  <h2>Last Used Protocol...</h2>
                </heading>
                <ProtocolCard attributes={testingProtocol} protocolUID="234234234" />
              </section>
              <aside className="setup-section__action">
                <div className="start-section__select-protocol">
                  <h4>Use different protocol</h4>
                  <div className="form-field-container">
                    <div className="form-field">
                      <select
                        name="scaleFactor"
                        className="select-css"
                        value="0"
                        // onChange={(e) => { setInterfaceScale(parseInt(e.target.value, 10)); }}
                      >
                        <option value="0">Select a protocol...</option>
                        <option value="1">Development Protocol</option>
                        <option value="2">My Special Protocol</option>
                        <option value="3">DPhil protocol</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="start-section__action">
                  <h4>Manage Protocols</h4>
                  <div className="library-card">
                    <h2>Open Protocol Library...</h2>
                  </div>
                </div>
              </aside>
            </main>
          </section>
          <section className="setup-section resume-section">
            <heading className="section-heading">
              <h1>Resume an Interview Session</h1>
            </heading>
            <main className="section-wrapper">
              <section className="setup-section__content">
                <heading>
                  <h2>Last Session...</h2>
                </heading>
                <SessionCard attributes={testSession} />
              </section>
              <aside className="setup-section__action">
                <h4>Resume Other Session</h4>
                <div className="resume-card">
                  <h2>+12 Sessions...</h2>
                </div>
              </aside>
            </main>
          </section>
          <section className="setup-section export-section">
            <heading className="section-heading">
              <h1>Export Data</h1>
            </heading>
            <main className="section-wrapper">
              <section className="setup-section__content">
                <heading>
                  <h2>All Unexported</h2>
                </heading>
                <div className="resume-card">
                  <h2>+12 Sessions...</h2>
                </div>
              </section>
              <section className="setup-section__content">
                <heading>
                  <h2>Select sessions to export</h2>
                </heading>
                <div className="resume-card">
                  <h2>Select Sessions</h2>
                </div>
              </section>
            </main>
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

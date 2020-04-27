import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';
import { get, sortBy, values, mapValues, omit } from 'lodash';
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
import { entityAttributesProperty } from '../../ducks/modules/network';

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
    lastActiveSession,
    activeProtocol,
    installedProtocols,
  } = props;

  const [showSessionList, setShowSessionList] = useState(false);

  // If we have an active session, don't render this component. Redirect to
  // the session route.
  if (isSessionActive) {
    const stageIndex = sessions[sessionId].stageIndex;
    const pathname = `/session/${sessionId}/${stageIndex}`;
    return (<Redirect to={{ pathname: `${pathname}` }} />);
  }

  const ResumeOtherSessionLabel = `+${Object.keys(sessions).length - 1} Other Interview${Object.keys(sessions).length - 1 > 1 ? 's' : null}...`;

  const ProtocolSelectOptions = Object.keys(installedProtocols).map(
    (protocol) => {
      if (protocol === activeProtocol) { return null; }
      return (<option key={protocol} value={protocol}>{installedProtocols[protocol].name}</option>);
    },
  );

  console.log('this', ProtocolSelectOptions);
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
          <section className="setup-section start-section">
            <header className="section-header">
              <h1>Start a New Interview</h1>
            </header>
            <main className="section-wrapper">
              <section className="setup-section__content">
                <header>
                  <h2>Last Active Protocol...</h2>
                </header>
                <ProtocolCard
                  attributes={installedProtocols[activeProtocol]}
                  protocolUID={activeProtocol}
                />
              </section>
              <aside className="setup-section__action">
                {ProtocolSelectOptions.length > 1 && (
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
                          <option value="" selected>Select a protocol...</option>
                          {ProtocolSelectOptions}
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                <div className="manage-protocols">
                  <h4>Manage Protocols</h4>
                  <div className="library-card">
                    <h2>Open Protocol Library...</h2>
                  </div>
                </div>
              </aside>
            </main>
          </section>
          {Object.keys(sessions).length > 0 && (
            <section className="setup-section resume-section">
              <header className="section-header">
                <h1>Resume an Interview</h1>
              </header>
              <main className="section-wrapper">
                <section className="setup-section__content">
                  <header>
                    <h2>Last Active Interview...</h2>
                  </header>
                  <SessionCard
                    sessionUUID={lastActiveSession.sessionUUID}
                    attributes={lastActiveSession.attributes}
                  />
                </section>
                { Object.keys(sessions).length > 2 && (
                  <aside className="setup-section__action">
                    <h4>Resume Other Interview</h4>
                    <div className="resume-card">
                      <h2>{ResumeOtherSessionLabel}</h2>
                    </div>
                  </aside>
                )}
              </main>
            </section>
          )}
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
};

SetupScreen.defaultProps = {
};

function mapStateToProps(state) {
  const getLastActiveSession = () => {
    const sessionsCollection = values(mapValues(state.sessions, (session, sessionUUID) => { session['sessionUUID'] = sessionUUID; return session; }));
    const lastActive = sortBy(sessionsCollection, ['updatedAt'])[0];
    return {
      sessionUUID: lastActive.sessionUUID,
      [entityAttributesProperty]: {
        ...omit(lastActive, 'sessionUUID'),
      },
    };
  };

  const getActiveProtocol = () => {
    const lastActiveSession = getLastActiveSession();

    return state.ui.activeProtocolUUID
      || lastActiveSession.protocolUID
      || Object.keys(state.installedProtocols)[0];
  };

  return {
    isSessionActive: !!state.activeSessionId,
    installedProtocols: state.installedProtocols,
    sessions: state.sessions,
    lastActiveSession: getLastActiveSession(),
    activeProtocol: getActiveProtocol(),
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

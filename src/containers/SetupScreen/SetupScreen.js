import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';
import { get } from 'lodash';
import { Redirect } from 'react-router-dom';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import cx from 'classnames';
import { Icon } from '@codaco/ui';
import { isIOS } from '../../utils/Environment';
import projectLogo from '../../images/project-logo.svg';
import betaProjectLogo from '../../images/project-logo-beta.svg';
import downArrow from '../../images/down-arrow.svg';
import SettingsMenuButton from '../../components/SettingsMenu/SettingsMenuButton';
import { ProtocolList, ProtocolImportOverlay, SessionListContainer, ImportProgressOverlay } from '.';


const SetupScreen = (props) => {
  const {
    sessions,
    isSessionActive,
    sessionId,
    importProtocolProgress,
  } = props;

  const [showSessionOverlay, setShowSessionOverlay] = useState(false);
  const [showImportProtocolOverlay, setShowImportProtocolOverlay] = useState(false);

  // If we have an active session, don't render this component. Redirect to
  // the session route.
  if (isSessionActive) {
    const stageIndex = sessions[sessionId].stageIndex;
    const pathname = `/session/${sessionId}/${stageIndex}`;
    return (<Redirect to={{ pathname: `${pathname}` }} />);
  }

  const resumeOverlayClassnames = cx(
    'resume-session-panel',
    { 'resume-session-panel--open': showSessionOverlay },
  );

  const setupClassnames = cx(
    'setup',
    { 'setup--show-sessions': showSessionOverlay },
    { 'setup--show-protocols': !showSessionOverlay },
  );

  return (
    <React.Fragment>
      <div className="bg bg-1" />
      <ProtocolImportOverlay
        show={showImportProtocolOverlay}
        onClose={() => setShowImportProtocolOverlay(false)}
      />
      <ImportProgressOverlay
        show={importProtocolProgress && importProtocolProgress.step > 0}
        progress={importProtocolProgress}
      />
      <div className={setupClassnames}>
        { !showSessionOverlay &&
        (<SettingsMenuButton />)
        }
        <div className="setup__header">
          <img src={isIOS() ? projectLogo : betaProjectLogo} className="logo setup__header--logo" alt="Network Canvas" />
        </div>
        <main className="setup__main">
          <ProtocolList />
        </main>
      </div>
      <div className={resumeOverlayClassnames}>
        <div className="resume-session-panel--toggle" role="button" tabIndex="0" onClick={() => setShowSessionOverlay(!showSessionOverlay)}>
          <div className="toggle-button">
            <img className="toggle-image" src={downArrow} alt="Resume interview" />
            <h4>
              { !showSessionOverlay ?
                ('Manage Interview Sessions') :
                ('Start New Session')
              }
            </h4>
          </div>

        </div>
        <SessionListContainer />
      </div>
      { !showSessionOverlay &&
      (<React.Fragment>
        <Icon
          name="add-a-protocol"
          className="setup__server-button"
          onClick={() => setShowImportProtocolOverlay(true)}
        />
      </React.Fragment>)}
    </React.Fragment>
  );
};

SetupScreen.propTypes = {
  sessions: PropTypes.object.isRequired,
  sessionId: PropTypes.string,
  isSessionActive: PropTypes.bool.isRequired,
  importProtocolProgress: PropTypes.object.isRequired,
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
    importProtocolProgress: state.importProtocol,
  };
}

export default withRouter(connect(mapStateToProps)(SetupScreen));

export { SetupScreen as UnconnectedSetupScreen };

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
import projectLogo from '../../images/project-logo.svg';
import betaProjectLogo from '../../images/project-logo-beta.svg';
import downArrow from '../../images/down-arrow.svg';
import SettingsMenuButton from '../../components/SettingsMenu/SettingsMenuButton';
import { ProtocolList, SessionList } from '.';

const ToggleSessionListButton = ({ sessionListShown }) => {
  return (
    <div className="session-panel-toggle" role="button" tabIndex="0" onClick={() => setShowSessionList(!showSessionList)}>
      <div className="toggle-button">
        <img className="toggle-image" src={downArrow} alt="Resume interview" />
        <h4>
          { !sessionListShown ?
            ('Manage Interview Sessions') :
            ('Start New Session')
          }
        </h4>
      </div>
    </div>
  );
};

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
      <SettingsMenuButton />
      <div className="setup-screen">
        <header className="setup-screen__header">
          <img src={isIOS() ? projectLogo : betaProjectLogo} className="header-logo" alt="Network Canvas" />
        </header>
        <main className="setup-screen__main">
          {/* <ToggleSessionListButton sessionListShown={showSessionList} /> */}
          {/* <ImportProtocolButton /> */}
          <ProtocolList />
          {/* <SessionList /> */}
        </main>
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

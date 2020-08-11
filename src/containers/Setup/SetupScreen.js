import React, { Component } from 'react';
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

/**
  * Setup screen
  * @extends Component
  */
class Setup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showSessionOverlay: false,
      showImportProtocolOverlay: false,
    };
  }

  render() {
    if (this.props.isSessionActive) {
      const stageIndex = this.props.sessions[this.props.sessionId].stageIndex;
      const pathname = `/session/${this.props.sessionId}/${stageIndex}`;
      return (<Redirect to={{ pathname: `${pathname}` }} />);
    }

    const resumeOverlayClassnames = cx(
      'resume-session-panel',
      { 'resume-session-panel--open': this.state.showSessionOverlay },
    );

    const setupClassnames = cx(
      'setup',
      { 'setup--show-sessions': this.state.showSessionOverlay },
      { 'setup--show-protocols': !this.state.showSessionOverlay },
    );

    return (
      <React.Fragment>
        <div className="bg bg-1" />
        <ProtocolImportOverlay
          show={this.state.showImportProtocolOverlay}
          onClose={() => this.setState({ showImportProtocolOverlay: false })}
        />
        <ImportProgressOverlay
          show={this.props.importProtocolProgress && this.props.importProtocolProgress.step > 0}
          progress={this.props.importProtocolProgress}
        />
        <div className={setupClassnames}>
          { !this.state.showSessionOverlay &&
          (<SettingsMenuButton />)
          }
          <div className="setup__header">
            <img src={isIOS() ? projectLogo : betaProjectLogo} className="logo setup__header--logo" alt="Network Canvas" />
            <a href="5.1.0/index.html">Switch version</a>
          </div>
          <main className="setup__main">
            <ProtocolList />
          </main>
        </div>
        <div className={resumeOverlayClassnames}>
          <div className="resume-session-panel--toggle" role="button" tabIndex="0" onClick={() => this.setState({ showSessionOverlay: !this.state.showSessionOverlay })}>
            <div className="toggle-button">
              <img className="toggle-image" src={downArrow} alt="Resume interview" />
              <h4>
                { !this.state.showSessionOverlay ?
                  ('Manage Interview Sessions') :
                  ('Start New Session')
                }
              </h4>
            </div>

          </div>
          <SessionListContainer />
        </div>
        { !this.state.showSessionOverlay &&
        (<React.Fragment>
          <Icon
            name="add-a-protocol"
            className="setup__server-button"
            onClick={() => this.setState({ showImportProtocolOverlay: true })}
          />
        </React.Fragment>)}
      </React.Fragment>
    );
  }
}

Setup.propTypes = {
  isSessionActive: PropTypes.bool.isRequired,
  sessionId: PropTypes.string,
  sessions: PropTypes.object.isRequired,
  importProtocolProgress: PropTypes.object.isRequired,
};

Setup.defaultProps = {
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

export default withRouter(connect(mapStateToProps)(Setup));

export { Setup as UnconnectedSetup };

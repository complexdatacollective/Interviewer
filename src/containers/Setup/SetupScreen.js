import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { get } from 'lodash';
import { Redirect } from 'react-router-dom';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import cx from 'classnames';
import networkCanvasLogo from '../../images/NC-Round.svg';
import projectLogo from '../../images/NC-Mark.svg';
import downArrow from '../../images/down-arrow.svg';
import { Icon } from '../../ui/components';
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
          <div className="setup__header">
            <img src={networkCanvasLogo} className="logo setup__header--logo" alt="Network Canvas" />
            <h1 className="type--title-1 setup__header--title">Network Canvas</h1>
          </div>
          <main className="setup__main">
            <ProtocolList />
          </main>
        </div>
        <div className={resumeOverlayClassnames}>
          <div className="resume-session-panel--toggle" role="button" tabIndex="0" onClick={() => this.setState({ showSessionOverlay: !this.state.showSessionOverlay })}>
            <img className="toggle-image" src={downArrow} alt="Resume interview" />
            <h4>
              { !this.state.showSessionOverlay ?
                ('Resume session') :
                ('Start new interview')
              }
            </h4>
          </div>
          <SessionListContainer />
        </div>
        { !this.state.showSessionOverlay &&
        (<React.Fragment>
          <img className="setup__project-logo" src={projectLogo} alt="Network Canvas" />
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

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { get } from 'lodash';
import { Redirect } from 'react-router-dom';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import networkCanvasLogo from '../../images/NC-Round.svg';
import projectLogo from '../../images/NC-Mark.svg';
import downArrow from '../../images/down-arrow.svg';
import { Icon } from '../../ui/components';
import { ProtocolList, ProtocolImportOverlay, ResumeSession, ImportProgressOverlay } from '.';

/**
  * Setup screen
  * @extends Component
  */
class Setup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showOptions: 'protocol',
      showImportProtocolOverlay: false,
    };
  }

  setOptions = (option) => {
    this.setState({
      showOptions: option,
    });
  }

  isShowProtocols = () => this.state.showOptions === 'protocol';

  isShowSessions = () => this.state.showOptions === 'session';

  render() {
    if (this.props.isSessionActive) {
      const stageIndex = this.props.sessions[this.props.sessionId].stageIndex;
      const pathname = `/session/${this.props.sessionId}/${stageIndex}`;
      return (<Redirect to={{ pathname: `${pathname}` }} />);
    }

    return (
      <React.Fragment>
        <div className="bg bg-1" />
        <div className="bg bg-2" />
        <div className="setup">
          <ProtocolImportOverlay
            show={this.state.showImportProtocolOverlay}
            onClose={() => this.setState({ showImportProtocolOverlay: false })}
          />
          <ImportProgressOverlay
            show={this.props.importProtocolProgress && this.props.importProtocolProgress.step > 0}
            progress={this.props.importProtocolProgress}
          />
          <div className="setup__header">
            <img src={networkCanvasLogo} className="logo setup__header--logo" alt="Network Canvas" />
            <h1 className="type--title-1 setup__header--title">Network Canvas</h1>
          </div>
          <main className="setup__main">
            <ProtocolList />
          </main>
          <div className="setup__footer">
            <div className="project-logo" >
              <img src={projectLogo} alt="Network Canvas" />
            </div>
            <div className={`setup__footer--link ${this.isShowSessions() ? 'setup__link--active' : ''}`} role="button" tabIndex="0" onClick={() => this.setOptions('session')}>
              <h4>Resume interview</h4>
              <img src={downArrow} alt="Resume interview" />
            </div>
            { this.isShowProtocols() &&
              <Icon
                name="add-a-protocol"
                className="setup__server-button"
                onClick={() => this.setState({ showImportProtocolOverlay: true })}
              />
            }
            <div className="resume-session-panel resume-session-panel--open">
              <ResumeSession />
            </div>
          </div>
        </div>
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

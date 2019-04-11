import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { get } from 'lodash';
import { Redirect } from 'react-router-dom';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import logo from '../../images/NC-Round.svg';
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

    let currentTab = <ProtocolList />;

    if (this.isShowSessions()) {
      currentTab = <ResumeSession />;
    }

    return (
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
          <div className="header-content">
            <div className="header-content__title">
              <img src={logo} className="logo header-content__logo" alt="Network Canvas" />
              <div className="header-content__title-text">
                <h1 className="type--title-1">Network Canvas</h1>
                <h4>Alpha 12 - No Coffee</h4>
              </div>
            </div>
            <div className="header-content__nav">
              <nav>
                <span className={`setup__link ${this.isShowProtocols() ? 'setup__link--active' : ''}`} role="button" tabIndex="0" onClick={() => this.setOptions('protocol')}>
                  Start new interview
                </span>
                <span className={`setup__link ${this.isShowSessions() ? 'setup__link--active' : ''}`} role="button" tabIndex="0" onClick={() => this.setOptions('session')}>
                  Resume interview
                </span>
              </nav>
            </div>
          </div>
        </div>
        <main className="setup__main">
          {currentTab}
        </main>
        { this.isShowProtocols() &&
          <Icon
            name="add-a-protocol"
            className="setup__server-button"
            onClick={() => this.setState({ showImportProtocolOverlay: true })}
          />
        }
      </div>
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

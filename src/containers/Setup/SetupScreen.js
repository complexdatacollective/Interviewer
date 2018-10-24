import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link, Redirect } from 'react-router-dom';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';


import logo from '../../images/NC-Round.svg';
import { Icon } from '../../ui/components';
import { actionCreators as uiActions } from '../../ducks/modules/ui';
import { ProtocolList, SessionList } from '.';

/**
  * Setup screen
  * @extends Component
  */
class Setup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showOptions: 'protocol',
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
    if (this.props.isProtocolLoaded) {
      const stageIndex = this.props.stageIndex ? this.props.stageIndex : 0;
      const pathname = `/session/${this.props.sessionId}/${this.props.protocolType}/${this.props.protocolPath}/${stageIndex}`;
      return (<Redirect to={{ pathname: `${pathname}` }} />);
    }

    let currentTab = <ProtocolList />;

    if (this.isShowSessions()) {
      currentTab = <SessionList />;
    }

    const startScreenIcon = () => (this.props.isPairedWithServer ? 'add-a-protocol' : 'pair-a-server');

    return (
      <div className="setup">
        <Icon name="settings" onClick={this.props.toggleMenu} />
        <div className="setup__header">
          <div className="header-content">
            <div className="header-content__title">
              <img src={logo} className="logo header-content__logo" alt="Network Canvas" />
              <div className="header-content__title-text">
                <h1 className="type--title-1">Network Canvas</h1>
                <h4>Alpha 9</h4>
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
          <Link to="/protocol-import">
            <Icon name={startScreenIcon()} className="setup__server-button" />
          </Link>
        }
      </div>
    );
  }
}

Setup.propTypes = {
  isProtocolLoaded: PropTypes.bool.isRequired,
  isPairedWithServer: PropTypes.bool.isRequired,
  protocolPath: PropTypes.string,
  protocolType: PropTypes.string.isRequired,
  sessionId: PropTypes.string.isRequired,
  stageIndex: PropTypes.number,
  toggleMenu: PropTypes.func.isRequired,
};

Setup.defaultProps = {
  protocolPath: '',
  isPairedWithServer: false,
  stageIndex: 0,
};

function mapStateToProps(state) {
  return {
    isFactory: state.protocol.isFactory,
    isProtocolLoaded: state.protocol.isLoaded,
    isPairedWithServer: !!state.pairedServer,
    protocolPath: state.protocol.path,
    protocolType: state.protocol.type,
    sessionId: state.session,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    toggleMenu: () => dispatch(uiActions.toggle('isMenuOpen')),
  };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Setup));

export { Setup as UnconnectedSetup };

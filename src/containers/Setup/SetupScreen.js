import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link, Redirect } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';

import deviceDescription from '../../utils/DeviceInfo';
import logo from '../../images/NC-Round.svg';
import { Button, Icon } from '../../ui/components';
import { actionCreators as deviceActions } from '../../ducks/modules/device';
import { actionCreators as protocolActions } from '../../ducks/modules/protocol';
import { actionCreators as sessionsActions } from '../../ducks/modules/sessions';
import { Form, ProtocolList, SessionList } from '../../containers/';
import { isElectron, isCordova } from '../../utils/Environment';

const formConfig = {
  formName: 'setup',
  fields: [
    {
      label: 'Protocol URL',
      name: 'protocol_url',
      component: 'TextInput',
      placeholder: 'Protocol URL',
      required: true,
    },
  ],
};

const initialValues = {
  protocol_url: 'https://github.com/codaco/example-protocols/raw/master/packaged/demo.netcanvas',
};

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
    this.deviceDescription = deviceDescription();
  }

  componentDidMount() {
    this.props.setDeviceDescription(this.deviceDescription);
  }

  onClickLoadFactoryProtocol = (protocolName) => {
    this.props.addSession();
    this.props.loadFactoryProtocol(protocolName);
  }

  onClickImportRemoteProtocol = (fields) => {
    if (fields) {
      this.props.addSession();
      this.props.downloadProtocol(fields.protocol_url);
    }
  }

  setOptions = (option) => {
    this.setState({
      showOptions: option,
    });
  }

  isShowProtocols = () => this.state.showOptions === 'protocol';

  isShowSessions = () => this.state.showOptions === 'session';

  renderImportButtons() {
    if (isElectron() || isCordova()) {
      return (
        <div>
          <Form
            className="setup__custom-protocol"
            form={formConfig.formName}
            onSubmit={this.onClickImportRemoteProtocol}
            initialValues={initialValues}
            controls={[<Button size="small" key="submit" aria-label="Import remote protocol">Import remote protocol</Button>]}
            {...formConfig}
          />
        </div>
      );
    }

    return null;
  }

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

    return (
      <div className="setup">
        <div className="setup__header">
          <img src={logo} className="logo setup__logo" alt="Network Canvas" />
          <nav>
            <h1 className="type--title-1">Network Canvas Alpha 4 - Gresley</h1>
            <span className={`setup__link ${this.isShowProtocols() ? 'setup__link--active' : ''}`} role="button" tabIndex="0" onClick={() => this.setOptions('protocol')}>
              Start new interview
            </span>
            <span className={`setup__link ${this.isShowSessions() ? 'setup__link--active' : ''}`} role="button" tabIndex="0" onClick={() => this.setOptions('session')}>
              Resume interview
            </span>
          </nav>
        </div>
        <main className="setup__main">
          {currentTab}
        </main>
        <Link to="/protocol-import">
          <Icon name="add-a-screen" className="setup__server-button" />
        </Link>
      </div>
    );
  }
}

Setup.propTypes = {
  addSession: PropTypes.func.isRequired,
  downloadProtocol: PropTypes.func.isRequired,
  isProtocolLoaded: PropTypes.bool.isRequired,
  loadFactoryProtocol: PropTypes.func.isRequired,
  protocolPath: PropTypes.string,
  protocolType: PropTypes.string.isRequired,
  sessionId: PropTypes.string.isRequired,
  setDeviceDescription: PropTypes.func.isRequired,
  stageIndex: PropTypes.number,
};

Setup.defaultProps = {
  protocolPath: '',
  stageIndex: 0,
};

function mapStateToProps(state) {
  return {
    isFactory: state.protocol.isFactory,
    isProtocolLoaded: state.protocol.isLoaded,
    protocolPath: state.protocol.path,
    protocolType: state.protocol.type,
    sessionId: state.session,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    addSession: bindActionCreators(sessionsActions.addSession, dispatch),
    downloadProtocol: bindActionCreators(protocolActions.downloadProtocol, dispatch),
    loadFactoryProtocol: bindActionCreators(protocolActions.loadFactoryProtocol, dispatch),
    setDeviceDescription: bindActionCreators(deviceActions.setDescription, dispatch),
  };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Setup));

export { Setup as UnconnectedSetup };

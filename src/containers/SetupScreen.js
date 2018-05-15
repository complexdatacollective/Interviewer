import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router';
// import { push } from 'react-router-redux';
import { connect } from 'react-redux';

import { Button } from '../ui/components';
import { actionCreators as protocolActions } from '../ducks/modules/protocol';
import { actionCreators as sessionsActions } from '../ducks/modules/sessions';
// import { actionCreators as sessionActions } from '../ducks/modules/session';
import { ServerList } from '../components/';
import { Form } from '../containers/';
import { isElectron, isCordova } from '../utils/Environment';
import logo from '../images/NC-Round.svg';

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
  onClickLoadFactoryProtocol = (protocolName) => {
    this.props.addSession();
    this.props.loadFactoryProtocol(protocolName);
    // TODO: to load a session looks like:
    // const pathname = this.props.getSessionPath('somethingelse');
    // this.props.setSession('somethingelse');
    // this.props.loadSession(pathname);
  }

  onClickImportRemoteProtocol = (fields) => {
    if (fields) {
      this.props.addSession();
      this.props.downloadProtocol(fields.protocol_url);
    }
  }

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

    return (
      <div className="setup">
        <div className="setup__header">
          <h1 className="type--title-1"><img src={logo} className="logo" alt="Network Canvas" /> Network Canvas Alpha 4 - Gresley</h1>
        </div>
        {this.renderImportButtons()}
        <div className="setup__start">
          <ServerList />
          <div className="setup__factory-protocol">
            <Button size="small" onClick={() => this.onClickLoadFactoryProtocol('education.netcanvas')} content="Load teaching protocol" />&nbsp;
            <Button size="small" color="platinum" onClick={() => this.onClickLoadFactoryProtocol('development.netcanvas')} content="Load dev protocol" />
          </div>
        </div>
      </div>
    );
  }
}

Setup.propTypes = {
  addSession: PropTypes.func.isRequired,
  downloadProtocol: PropTypes.func.isRequired,
  // getSessionPath: PropTypes.func.isRequired,
  isProtocolLoaded: PropTypes.bool.isRequired,
  loadFactoryProtocol: PropTypes.func.isRequired,
  // loadSession: PropTypes.func.isRequired,
  protocolPath: PropTypes.string,
  protocolType: PropTypes.string.isRequired,
  sessionId: PropTypes.string.isRequired,
  // setSession: PropTypes.func.isRequired,
  stageIndex: PropTypes.number,
};

Setup.defaultProps = {
  protocolPath: '',
  stageIndex: 0,
};

function mapStateToProps(state) {
  return {
    // getSessionPath: sessionId => state.sessions[sessionId].path,
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
    // loadSession: path => dispatch(push(path)),
    // setSession: bindActionCreators(sessionActions.setSession, dispatch),
  };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Setup));

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import { Button } from '../ui/src/components';
import { actionCreators as protocolActions } from '../ducks/modules/protocol';
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
    this.props.loadFactoryProtocol(protocolName);
  }

  onClickImportRemoteProtocol = (fields) => {
    if (fields) {
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
      const pathname = `/protocol/${this.props.protocolType}/${this.props.protocolPath}/0`;
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
  downloadProtocol: PropTypes.func.isRequired,
  isProtocolLoaded: PropTypes.bool.isRequired,
  loadFactoryProtocol: PropTypes.func.isRequired,
  protocolPath: PropTypes.string,
  protocolType: PropTypes.string.isRequired,
};

Setup.defaultProps = {
  protocolPath: '',
};

function mapStateToProps(state) {
  return {
    isFactory: state.protocol.isFactory,
    isProtocolLoaded: state.protocol.isLoaded,
    protocolPath: state.protocol.path,
    protocolType: state.protocol.type,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    downloadProtocol: bindActionCreators(protocolActions.downloadProtocol, dispatch),
    loadFactoryProtocol: bindActionCreators(protocolActions.loadFactoryProtocol, dispatch),
  };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Setup));

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { actionCreators as dialogActions } from '../../ducks/modules/dialogs';
import { actionCreators as serverActions } from '../../ducks/modules/pairedServer';
import { Button } from '../../ui/components';
import ApiClient from '../../utils/ApiClient';
import { ServerUnavailable } from '../../components/Setup';
import logo from '../../images/Srv-Flat.svg';

const noClick = () => {};

/**
 * Renders a server icon & label. The label defaults to server name, falling back
 * to its first address (both provided via the `data` prop). If `secondaryLabel`
 * is provided, then it will be appended.
 */
class PairedServerWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
    };
  }

  componentDidMount() {
    const { pairedServer } = this.props;
    this.apiClient = new ApiClient(pairedServer);
    this.testServerConnection();
  }

  handleApiError(err) {
    this.setState({ error: err });
  }

  handleRetry = () => {
    this.setState({ error: null }, this.testServerConnection);
  }

  testServerConnection = () => {
    // TODO: replace this with a decicated heartbeat endpoint on Server
    this.apiClient
      .addTrustedCert()
      .then(() => this.apiClient.getProtocols())
      .catch(err => this.handleApiError(err));
  }

  render() {
    const {
      data,
      secondaryLabel,
      selectServer,
      className,
      openDialog,
      unpairServer,
      children,
    } = this.props;

    const {
      error,
    } = this.state;

    const cssClass = classNames(
      'server-card',
      { 'server-card--error': error },
      { 'server-card--clickable': selectServer !== noClick },
      className,
    );
    const { name, addresses = [] } = data;
    let label = name || addresses[0];
    if (secondaryLabel) {
      label += ` ${secondaryLabel}`;
    }

    const handleUnpairRequest = () => {
      openDialog({
        type: 'Warning',
        title: 'Unpair this Server?',
        confirmLabel: 'Unpair Server',
        onConfirm: unpairServer,
        message: 'This will remove the connection to this instance of Server. Are you sure you want to continue?',
      });
    };

    return (
      <div className="server-card-wrapper">
        <div className={cssClass} onClick={() => selectServer(data)} >
          <img src={logo} className="server-card__icon" alt="Available Server" />
          <h4 className="server-card__label">
            {label}
          </h4>
          <Button size="small" color="mustard" onClick={handleUnpairRequest}>Unpair</Button>
        </div>
        <div className="server-card-container">
          { error ?
            (
              <ServerUnavailable
                errorMessage={error.friendlyMessage || error.message}
                handleRetry={this.handleRetry}
              />
            ) : children
          }
        </div>
      </div>
    );
  }
}

PairedServerWrapper.propTypes = {
  data: PropTypes.shape({
    name: PropTypes.string,
    addresses: PropTypes.array,
  }),
  className: PropTypes.string,
  selectServer: PropTypes.func,
  secondaryLabel: PropTypes.string,
  unpairServer: PropTypes.func.isRequired,
  openDialog: PropTypes.func.isRequired,
  children: PropTypes.node,
  pairedServer: PropTypes.object,
};

PairedServerWrapper.defaultProps = {
  data: {},
  className: '',
  selectServer: noClick,
  secondaryLabel: null,
  children: null,
  pairedServer: null,
};

function mapDispatchToProps(dispatch) {
  return {
    openDialog: bindActionCreators(dialogActions.openDialog, dispatch),
    unpairServer: bindActionCreators(serverActions.unpairServer, dispatch),
  };
}

function mapStateToProps(state) {
  return {
    pairedServer: state.pairedServer,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(PairedServerWrapper);

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import ApiClient from '../../utils/ApiClient';
import { NewFilterableListWrapper, ServerProtocolCard } from '../../components';


/**
 * @class
 * Renders a list of protocols, from which a user can choose to download.
 */
class ServerProtocols extends Component {
  constructor(props) {
    super(props);
    this.state = {
      protocols: [],
    };
  }

  componentDidMount() {
    const { pairedServer } = this.props;
    this.apiClient = new ApiClient(pairedServer);
    this.fetchProtocolList();
  }

  handleApiError(err) {
    this.setState({ error: err });
  }

  fetchProtocolList = () => {
    this.apiClient
      .addTrustedCert()
      .then(() => this.apiClient.getProtocols())
      .then(protocols => this.setState({ protocols }))
      .catch(err => this.handleApiError(err));
  }

  handleRetry = () => {
    this.setState({ error: null }, this.fetchProtocolList);
  }

  handleSelectProtocol = (protocol) => {
    this.props.importProtocolFromURI(protocol.downloadPath, true);
  }

  render() {
    const { error, protocols } = this.state;

    console.log('SP:', this.props, this.state);

    return (
      <NewFilterableListWrapper
        ItemComponent={ServerProtocolCard}
        itemProperties={{
          onClickHandler: () => console.log('cleeeek'),
        }}
        items={protocols}
        initialSortProperty="name"
        initialSortDirection="asc"
        sortableProperties={[
          {
            label: 'Name',
            variable: 'name',
          },
          {
            label: 'Schema Version',
            variable: 'schemaVersion',
          },
          {
            label: 'Last Modified',
            variable: 'lastModified',
          },
        ]}
      />
    );
  }
}

ServerProtocols.propTypes = {
  importProtocolFromURI: PropTypes.func.isRequired,
  pairedServer: PropTypes.object.isRequired,
  server: PropTypes.shape({
    pairingServiceUrl: PropTypes.string.isRequired,
  }).isRequired,
};

function mapStateToProps(state) {
  return {
    pairedServer: state.pairedServer,
  };
}

export default connect(mapStateToProps)(ServerProtocols);

export { ServerProtocols as UnconnectedServerProtocols };

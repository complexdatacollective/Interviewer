import React, { Component } from 'react';
import { connect } from 'react-redux';

import { NodeList } from '../../components/Elements';

class NodeProvider extends Component {
  render() {
    const {
      network,
    } = this.props;

    return (
      <div class='node-provider'>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    network: state.network,
  }
}

export default connect(mapStateToProps)(NodeProvider);

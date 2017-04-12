import React, { Component } from 'react';
import { Prompt, NodeList, NodeCreator } from '../../components/InterfaceComponents';
import { connect } from 'react-redux';

/**
  * This would be specified in the protocol, and draws upon ready made components
  */
class NameGeneratorInterface extends Component {
  render() {
    const {
      network
    } = this.props;

    return (
      <div>
        <h3>Name Generator Interface</h3>
        <NodeList network={ network } />
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    network: state.network
  }
}

export default connect(mapStateToProps)(NameGeneratorInterface);

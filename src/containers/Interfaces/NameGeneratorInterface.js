import React, { Component } from 'react';
import { Prompt, NodeList } from '../../components/InterfaceComponents';
import { connect } from 'react-redux';



/**
  * This would be specified in the protocol, and draws upon ready made components
  */
class NameGeneratorInterface extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentPromptIndex: 0
    }
  }

  render() {
    const {
      network
    } = this.props;

    const {
      prompts
    } = this.props.config.params;

    return (
      <div>
        <h3>Name Generator Interface</h3>
        <Prompt prompts={ prompts } currentIndex={ this.state.currentPromptIndex } />
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

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { NameGeneratorInterface } from './Interfaces';

/**
  * Render a protocol interface based on protocol info and index
  */
class Stage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentStage: null
    }
  }

  render() {
    const {
      protocol
    } = this.props.protocol.protocolConfig;

    // TODO: Load dynamically based on protocol using some kind of service?
    const CurrentInterface = NameGeneratorInterface;

    return (
      <div className='container'>
        <CurrentInterface />
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    protocol: state.protocol
  }
}

export default connect(mapStateToProps)(Stage);

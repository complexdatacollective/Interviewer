import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { actionCreators as protocolActions } from '../ducks/modules/protocol';

import { ProtocolStage } from '../containers';

class Protocol extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentStageIndex: 0
    }
  }

  componentWillMount() {
    if (!this.props.protocol.protocolLoaded) {
      this.props.loadProtocol()
    }
  }

  nextStage = (e) => {
    e.preventDefault();
    const maxStep = this.props.protocol.protocolConfig.stages.length - 1;
    const nextStage = this.state.currentStageIndex + 1 < maxStep ?
      this.state.currentStageIndex + 1 : maxStep;
    this.setState({ currentStageIndex: nextStage })
  }

  previousStage = (e) => {
    e.preventDefault();
    const previousStage = this.state.currentStageIndex - 1 > -1 ?
      this.state.currentStageIndex - 1 : 0;
    this.setState({ currentStageIndex: previousStage });
  }

  render() {
    const {
      participant,
      protocol: { protocolConfig }
    } = this.props;
    return (
      <div className='container'>
        <div className='col'>
          <h4 className=''>
            Welcome {participant.userProfile && participant.userProfile.name}
          </h4>
          <p className='small'>{protocolConfig.name} {protocolConfig.version}</p>
        </div>
        <div className='col'>
          {
            protocolConfig.stages &&
            protocolConfig.stages.map((stage, idx) =>
              this.state.currentStageIndex === idx && <ProtocolStage key={idx} stage={stage} />
            )
          }
        </div>
        <div className='col'>
          <button
            onClick={this.previousStage}
          >Go back</button>
          <button
            type='button'
            onClick={this.nextStage}
          > Next </button>
        </div>
      </div>
    );
  }
}

Protocol.propTypes = {
  loadProtocol: React.PropTypes.func,
  participant: React.PropTypes.object,
  protocol: React.PropTypes.object
}

function mapStateToProps(state) {
  return {
    participant: state.participant,
    protocol: state.protocol
  }
}

function mapDispatchToProps(dispatch) {
  return {
    loadProtocol: bindActionCreators(protocolActions.loadProtocol, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Protocol);

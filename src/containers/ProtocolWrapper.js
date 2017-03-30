import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { actionCreators as protocolActions } from '../ducks/modules/protocol';

import { ProtocolStage } from '../containers';

class ProtocolWrapper extends Component {
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

  nextStep = (e) => {
    e.preventDefault();
    const maxStep = this.props.protocol.protocolConfig.stages.length - 1;
    const nextStep = this.state.currentStageIndex + 1 < maxStep ?
      this.state.currentStageIndex + 1 : maxStep;
    this.setState({ currentStageIndex: nextStep })
  }

  previousStep = (e) => {
    e.preventDefault();
    const previousStep = this.state.currentStageIndex - 1 > -1 ?
      this.state.currentStageIndex - 1 : 0;
    this.setState({ currentStageIndex: previousStep });
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
            onClick={this.previousStep}
          >Go back</button>
          <button
            type='button'
            onClick={this.nextStep}
          > Next </button>
        </div>
      </div>
    );
  }
}

ProtocolWrapper.propTypes = {
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

export default connect(mapStateToProps, mapDispatchToProps)(ProtocolWrapper);

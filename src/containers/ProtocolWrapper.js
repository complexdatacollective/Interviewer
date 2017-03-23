import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { actionCreators as protocolActions } from '../ducks/modules/protocol';

import { ProtocolStage } from '../containers';
import { Button } from 'semantic-ui-react';

/**
 * Wraps protocols
 *
 * @extends Component
 */
class ProtocolWrapper extends Component {
  /**
   * Creates an instance of ProtocolWrapper.
   * @param {any} props
   *
   */
  constructor(props) {
    super(props);
    this.state = {
      currentStageIndex: 0
    }
  }

  /**
   * Called when the component is about to be mounted to the DOM
   */
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
      <div className='grid__container'>
        <div className='grid__item grid--p-small'>
          <h1 className='type--home-title title--center'>
            Welcome {participant.userProfile && participant.userProfile.name}
          </h1>
          <p className='type--copy-small'>{protocolConfig.name} {protocolConfig.version}</p>
        </div>
        <div className='grid__item grid--p-small'>
          {
            protocolConfig.stages &&
            protocolConfig.stages.map((stage, idx) =>
              this.state.currentStageIndex === idx && <ProtocolStage key={idx} stage={stage} />
            )
          }
        </div>
        <div className='grid__item grid--x-bookend'>
          <Button
            content='Go back'
            icon='left arrow'
            labelPosition='left'
            onClick={this.previousStep}
          />
          <Button
            type='button'
            className='button--primary'
            content='Next'
            icon='right arrow'
            labelPosition='right'
            onClick={this.nextStep}
          />
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

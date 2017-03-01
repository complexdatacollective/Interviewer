import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { actionCreators as protocolActions } from '../ducks/modules/protocol';

class ProtocolWrapper extends Component {
  componentWillMount() {
    this.props.loadProtocol()
  }

  render() {
    const {
      participant
    } = this.props;
    return (
      <div className='grid__container'>
        <div className='grid__item grid--p-small'>
          <h1 className='type--home-title title--center'>
            Welcome {participant.userProfile && participant.userProfile.name}
          </h1>

        </div>
      </div>
    );
  }
}

ProtocolWrapper.propTypes = {
  auth: React.PropTypes.object,
  network: React.PropTypes.object,
  participant: React.PropTypes.object,
  protocol: React.PropTypes.object
}

function mapStateToProps(state) {
  return {
    auth: state.auth,
    network: state.network,
    participant: state.participant,
    protocol: state.protocol,
    nodeForm: state.form.node
  }
}

function mapDispatchToProps(dispatch) {
  return {
    loadProtocol: bindActionCreators(protocolActions.loadProtocol, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ProtocolWrapper);

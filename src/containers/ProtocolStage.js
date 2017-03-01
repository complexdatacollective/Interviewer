import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { ProtocolQuestion } from '../components';
class ProtocolStage extends Component {
  render() {
    const {
      title,
      params
    } = this.props.stage;
    return (
      <div className='grid__container'>
        <div className='grid__item grid--p-small'>
          Stage Title: {title}
        </div>
        <div className='grid__item grid--p-small'>
          {
            params.questions &&
            params.questions.map((question, idx) =>
              <ProtocolQuestion key={idx} question={question} />
            )
          }
        </div>
      </div>
    );
  }
}

ProtocolStage.propTypes = {
  stage: React.PropTypes.object
}

function mapStateToProps(state) {
  return {
    auth: state.auth,
    network: state.network,
    participant: state.participant,
    protocol: state.protocol
  }
}

export default connect(mapStateToProps)(ProtocolStage);

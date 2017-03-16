import React, { Component } from 'react';
import { connect } from 'react-redux';

import { NameGeneratorForm } from '../containers/Forms';
import ProtocolService from '../utils/ProtocolService';

const protocolService = new ProtocolService();
class ProtocolQuestion extends Component {
  render() {
    const {
      label,
      name,
      skip
    } = this.props.question;

    if (this.props.protocolForm && this.props.protocolForm.values) {
      // TODO - skip logic using templating strings
      if (skip) {
        const evalStr = protocolService.evaluateSkipLogic(skip, `this.props.protocolForm.values`);
        // eslint-disable-next-line
        console.log(eval(evalStr));
        // eslint-disable-next-line
        if (eval(evalStr)) {
          console.log('eval true', evalStr);
          return null;
        }
      }
    }

    return (
      <div className='grid__container'>
        <div className='grid__item grid--p-small'>
          {label}
        </div>
        <div className='grid__item grid--p-small'>
          <NameGeneratorForm
            fieldName={name} />
        </div>
      </div>
    );
  }
}

ProtocolQuestion.propTypes = {
  question: React.PropTypes.object
}

function mapStateToProps(state) {
  return {
    auth: state.auth,
    network: state.network,
    participant: state.participant,
    protocol: state.protocol,
    protocolForm: state.form.protocolForm
  }
}

export default connect(mapStateToProps)(ProtocolQuestion);

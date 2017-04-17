import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { actionCreators as networkActions } from '../../ducks/modules/network';

import { StagePrompt } from '../Elements';
import { NodeList, ModalForm } from '../../components/Elements';

const nodeLabel = function(node) {
  return `${node.nickname}`;
};

/**
  * This would/could be specified in the protocol, and draws upon ready made components
  */
class NameGeneratorInterface extends Component {
  handleModalFormSubmit(node) {
    const {
      addNode,
      promptAttributes
    } = this.props;

    if (node) {
      addNode({ ...node, promptAttributes });
    }
  }

  render() {
    const {
      network,
      form
    } = this.props;

    return (
      <div className='interface'>
        <StagePrompt />
        <NodeList network={ network } label={ nodeLabel } />
        <ModalForm { ...form } form={ form.formName } onSubmit={ this.handleModalFormSubmit.bind(this) }/>
      </div>
    )
  }
}

function mapStateToProps(state) {
  const currentStage = state.protocol.protocolConfig.stages[0];
  const promptAttributes = currentStage.params.prompts[state.stage.promptIndex].nodeAttributes;
  const form = currentStage.params.form;

  return {
    network: state.network,
    stage: state.stage,
    protocol: state.protocol,
    promptAttributes,
    form
  }
}

function mapDispatchToProps(dispatch) {
  return {
    addNode: bindActionCreators(networkActions.addNode, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(NameGeneratorInterface);

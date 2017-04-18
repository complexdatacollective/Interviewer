import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { actionCreators as networkActions } from '../../ducks/modules/network';

import { StagePrompt } from '../../containers/Elements';
import { NodeList, Modal, Form } from '../../components/Elements';

const nodeLabel = function(node) {
  return `${node.nickname}`;
};

/**
  * This would/could be specified in the protocol, and draws upon ready made components
  */
class NameGeneratorInterface extends Component {
  constructor(props) {
    super(props);

    this.state = { isOpen: false };
  }

  toggleModal = () => {
    this.setState({
      isOpen: !this.state.isOpen
    });
  }

  handleFormSubmit(node, _, form) {
    const {
      addNode,
      promptAttributes
    } = this.props;

    if (node) {
      addNode({ ...node, promptAttributes });
      form.reset();  // Is this the "react/redux way"?
      this.toggleModal();
    }
  }

  render() {
    const {
      network,
      config: {
        params: {
          form,
          prompts
        }
      }
    } = this.props;

    return (
      <div className='interface'>
        <StagePrompt prompts={ prompts } />
        <NodeList network={ network } label={ nodeLabel } />
        <button onClick={this.toggleModal}>
          { form.title }
        </button>

        <Modal show={this.state.isOpen} onClose={this.toggleModal}>
          <h4>{ form.title }</h4>
          <Form { ...form } form={ form.formName } onSubmit={ this.handleFormSubmit.bind(this) }/>
        </Modal>
      </div>
    )
  }
}

function mapStateToProps(state, ownProps) {
  const promptAttributes = ownProps.config.params.prompts[state.session.promptIndex].nodeAttributes;

  return {
    network: state.network,
    protocol: state.protocol,
    promptAttributes
  }
}

function mapDispatchToProps(dispatch) {
  return {
    addNode: bindActionCreators(networkActions.addNode, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(NameGeneratorInterface);

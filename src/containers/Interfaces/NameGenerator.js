import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { actionCreators as networkActions } from '../../ducks/modules/network';

import { PromptSwiper, Panels } from '../../containers/Elements';
import { NodeList, Modal, Form } from '../../components/Elements';

const nodeLabel = function(node) {
  return `${node.nickname}`;
};

const rotateIndex = (max, next) => {
  return (next + max) % max;
}

/**
  * This would/could be specified in the protocol, and draws upon ready made components
  */
class NameGeneratorInterface extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isOpen: false,
      promptIndex: 0,
    };

    this.nextPrompt = this.nextPrompt.bind(this);
    this.previousPrompt = this.previousPrompt.bind(this);
    this.handleFormSubmit = this.handleFormSubmit.bind(this);
  }

  nextPrompt() {
    this.setState({
      promptIndex: rotateIndex(this.props.prompts.length, this.state.promptIndex + 1)
    });
  }

  previousPrompt() {
    this.setState({
      promptIndex: rotateIndex(this.props.prompts.length, this.state.promptIndex - 1)
    });
  }

  promptAttributes() {
    return this.props.prompts[this.state.promptIndex].nodeAttributes;
  }

  handlePanelDrag = (node) => {
    console.log('panel drag', node);
  }

  handlePanelSelect = (node) => {
    console.log('panel select', node);
  }

  toggleModal = () => {
    this.setState({
      isOpen: !this.state.isOpen
    });
  }

  handleFormSubmit(node, _, form) {
    if (node) {
      this.props.addNode({ ...node, attributes: this.promptAttributes() });
      form.reset();  // Is this the "react/redux way"?
      this.toggleModal();
    }
  }

  render() {
    const {
      network: {
        nodes
      },
      prompts,
      form,
      panels
    } = this.props;

    return (
      <div className='interface'>
        <div className='interface__aside'>
          <Panels panels={ panels } nodes={ nodes } handleSelect={ this.handlePanelSelect } handleDrag={ this.handlePanelDrag }/>
        </div>
        <div className='interface__primary'>
          <PromptSwiper prompts={ prompts } promptIndex={ this.state.promptIndex } handleNext={ this.nextPrompt } handlePrevious={ this.previousPrompt } />

          <NodeList nodes={ nodes } label={ nodeLabel } />
          <button onClick={this.toggleModal}>
            Add a person
          </button>

          <Modal show={this.state.isOpen} onClose={this.toggleModal}>
            <h4>{ form.title }</h4>
            <Form { ...form } form={ form.formName } onSubmit={ this.handleFormSubmit }/>
          </Modal>
        </div>
      </div>
    )
  }
}

function mapStateToProps(state, ownProps) {
  return {
    network: state.network,
    protocol: state.protocol,
    prompts: ownProps.config.params.prompts,
    form: ownProps.config.params.form,
    panels: ownProps.config.params.panels,
  }
}

function mapDispatchToProps(dispatch) {
  return {
    addNode: bindActionCreators(networkActions.addNode, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(NameGeneratorInterface);

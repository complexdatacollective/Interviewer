import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { actionCreators as networkActions } from '../../ducks/modules/network';

import { PromptSwiper, NodeProviderPanels } from '../../containers/Elements';
import { NodeList, Node, Modal, Form } from '../../components/Elements';

const rotateIndex = (max, next) => {
  return (next + max) % max;
}

const includes = (a, b) => {
  return Object.keys(b).map((key) => {
    return a[key] === b[key];
  }).reduce((sum, x) => {
    return sum && x;
  }, true);
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

  currentPromptAttributes() {
    return this.props.prompts[this.state.promptIndex].nodeAttributes;
  }

  currentNodeAttributes() {
    return { type: this.props.nodeType, ...this.currentPromptAttributes() };
  }

  currentNodes() {
    const nodes = this.props.network.nodes;
    return nodes.filter((node) => {
      return includes(node, this.currentNodeAttributes());
    });
  }

  toggleModal = () => {
    this.setState({
      isOpen: !this.state.isOpen
    });
  }

  handleFormSubmit(node, _, form) {
    if (node) {
      this.props.addNode({ ...node, ...this.currentNodeAttributes() });
      form.reset();  // Is this the "react/redux way"?
      this.toggleModal();
    }
  }

  render() {
    const {
      prompts,
      form,
      panels
    } = this.props;

    return (
      <div className='interface'>
        <div className='interface__aside'>
          <NodeProviderPanels config={ panels } />
        </div>
        <div className='interface__primary'>
          <PromptSwiper prompts={ prompts } promptIndex={ this.state.promptIndex } handleNext={ this.nextPrompt } handlePrevious={ this.previousPrompt } />

          <NodeList>
            { this.currentNodes().map((node, index) => {
              const label = `${node.nickname}`;
              return <Node key={ index } label={ label } />;
            }) }
          </NodeList>

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
    nodeType: ownProps.config.params.nodeType,
  }
}

function mapDispatchToProps(dispatch) {
  return {
    addNode: bindActionCreators(networkActions.addNode, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(NameGeneratorInterface);

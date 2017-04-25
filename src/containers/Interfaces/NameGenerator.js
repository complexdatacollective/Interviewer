import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { actionCreators as networkActions } from '../../ducks/modules/network';

import { PromptSwiper, NodeProviderPanels } from '../../containers/Elements';
import { NodeList, Node, Modal, Form } from '../../components/Elements';

import { diff, nodeIncludesAttributes } from '../../utils/Network';

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
  }

  nextPrompt = () => {
    this.setState({ promptIndex: rotateIndex(this.props.prompts.length, this.state.promptIndex + 1) });
  }

  previousPrompt = () => {
    this.setState({ promptIndex: rotateIndex(this.props.prompts.length, this.state.promptIndex - 1) });
  }

  toggleModal = () => {
    this.setState({
      isOpen: !this.state.isOpen
    });
  }

  handleAddNode = (node, _, form) => {
    if (node) {
      this.props.addNode({ ...node, ...this.activeNodeAttributes() });
      form.reset();  // Is this the "react/redux way"?
      this.toggleModal();
    }
  }

  activeNodeAttributes() {
    const {
      prompts,
      nodeType,
    } = this.props;

    const promptAttributes = prompts[this.state.promptIndex].nodeAttributes;
    return { type: nodeType, ...promptAttributes };
  }

  activeNetwork() {
    const {
      network
    } = this.props;

    return nodeIncludesAttributes(network, this.activeNodeAttributes());
  }

  render() {
    const {
      prompts,
      form,
      panels
    } = this.props;

    const providerFilter = (network) => { return diff(network, this.activeNetwork()); }

    return (
      <div className='interface'>
        <div className='interface__aside'>
          <NodeProviderPanels config={ panels } filter={ providerFilter } />
        </div>
        <div className='interface__primary'>
          <PromptSwiper prompts={ prompts } promptIndex={ this.state.promptIndex } handleNext={ this.nextPrompt } handlePrevious={ this.previousPrompt } />

          <NodeList>
            { this.activeNetwork().nodes.map((node, index) => {
              const label = `${node.nickname}`;
              return <Node key={ index } label={ label } />;
            }) }
          </NodeList>

          <button onClick={ this.toggleModal }>
            Add a person
          </button>

          <Modal show={ this.state.isOpen } onClose={ this.toggleModal }>
            <h4>{ form.title }</h4>
            <Form { ...form } form={ form.formName } onSubmit={ this.handleAddNode }/>
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

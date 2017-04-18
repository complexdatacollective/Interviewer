import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { actionCreators as stageActions } from '../../ducks/modules/stage';

import { Prompt } from '../../components/Elements';

class StagePrompt extends Component {
  constructor(props) {
    super(props);

    this.handleTap = this.handleTap.bind(this);
    this.handleSwipe = this.handleSwipe.bind(this);
  }

  handleSwipe(event) {
    if(event.direction === 2) {
      this.props.nextPrompt();
    }
  }

  handleTap() {
    this.props.nextPrompt();
  }

  render() {
    const {
      promptIndex,
      prompts
    } = this.props;

    return (
      <Prompt prompts={ prompts } currentIndex={ promptIndex } handleTap={ this.handleTap } handleSwipe={ this.handleSwipe } />
    );
  }
}

function mapStateToProps(state) {
  const currentStage = state.protocol.protocolConfig.stages[state.stage.stageIndex];

  return {
    prompts: currentStage.params.prompts,
    promptIndex: state.stage.promptIndex
  }
}

function mapDispatchToProps(dispatch) {
  return {
    nextPrompt: bindActionCreators(stageActions.nextPrompt, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(StagePrompt);

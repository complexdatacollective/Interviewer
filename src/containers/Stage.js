import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { actionCreators as stageActions } from '../ducks/modules/stage';

import { NameGenerator } from './Interfaces';

/**
  * Render a protocol interface based on protocol info and index
  */
class Stage extends Component {
  constructor(props) {
    super(props);

    this.handleNext = this.handleNext.bind(this);
    this.handlePrevious = this.handlePrevious.bind(this);
  }

  handleNext() {
    this.props.next();
  }

  handlePrevious() {
    this.props.previous();
  }

  render() {
    // TODO: Load dynamically based on protocol using some kind of service?
    const CurrentInterface = NameGenerator;

    const {
      handleNext,
      handlePrevious,
      props: {
        stage
      }
    } = this;

    return (
      <div className='container'>
        <button onClick={handlePrevious}>Back</button>
        <CurrentInterface config={ stage }/>
        <button onClick={handleNext}>Next</button>
      </div>
    );
  }
}

function mapStateToProps(state, ownProps) {
  // TODO: http://redux.js.org/docs/recipes/ComputingDerivedData.html
  const stage = state.protocol.protocolConfig.stages.find(stage => stage.id === ownProps.id)
    || state.protocol.protocolConfig.stages[state.session.stage.index];

  return {
    stage
  }
}

function mapDispatchToProps(dispatch) {
  return {
    next: bindActionCreators(stageActions.next, dispatch),
    previous: bindActionCreators(stageActions.previous, dispatch),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Stage);

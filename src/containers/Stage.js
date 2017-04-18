import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { actionCreators as sessionActions } from '../ducks/modules/session';

import { NameGeneratorInterface } from './Interfaces';

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
    const CurrentInterface = NameGeneratorInterface;

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

function mapStateToProps(state) {
  const stage = state.protocol.protocolConfig.stages[state.session.stageIndex];

  return {
    stage
  }
}

function mapDispatchToProps(dispatch) {
  return {
    next: bindActionCreators(sessionActions.nextStage, dispatch),
    previous: bindActionCreators(sessionActions.previousStage, dispatch),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Stage);

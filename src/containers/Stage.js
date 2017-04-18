import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { actionCreators as stageActions } from '../ducks/modules/stage';

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
    } = this;

    return (
      <div className='container'>
        <button onClick={handlePrevious}>Back</button>
        <CurrentInterface />
        <button onClick={handleNext}>Next</button>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    protocol: state.protocol
  }
}

function mapDispatchToProps(dispatch) {
  return {
    next: bindActionCreators(stageActions.nextStage, dispatch),
    previous: bindActionCreators(stageActions.previousStage, dispatch),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Stage);

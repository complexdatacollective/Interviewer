import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { actionCreators as stageActions } from '../ducks/modules/stage';
import { stage } from '../selectors/session';

import { NameGenerator, Quiz } from './Interfaces';

function loadInterface(options) {
  if (Object.hasOwnProperty.call(options, 'custom')) { return options.custom; }
  switch (options) {
    case 'name-generator':
      return NameGenerator;
    case 'quiz':
      return Quiz;
    default:
      return null;
  }
}

/**
  * Render a protocol interface based on protocol info and id
  * @extends Component
  */
class Stage extends Component {
  // change the stage to the next
  onClickNext = () => {
    this.props.next();
  }

  // change the stage to the previous
  onClickBack = () => {
    this.props.previous();
  }

  render() {
    const CurrentInterface = loadInterface(this.props.currentStage.type);

    return (
      <div className="stage">
        <div className="stage__control">
          <button
            className="stage__control-button stage__control-button--back"
            onClick={this.onClickBack}
          >
            Back
          </button>
        </div>
        <div className="stage__interface">
          { CurrentInterface && <CurrentInterface config={this.props.currentStage} /> }
        </div>
        <div className="stage__control">
          <button
            className="stage__control-button stage__control-button--next"
            onClick={this.onClickNext}
          >
            Next
          </button>
        </div>
      </div>
    );
  }
}

Stage.propTypes = {
  currentStage: PropTypes.object.isRequired,
  next: PropTypes.func.isRequired,
  previous: PropTypes.func.isRequired,
};

function mapStateToProps(state) {
  const currentStage = stage(state);

  return {
    currentStage,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    next: bindActionCreators(stageActions.next, dispatch),
    previous: bindActionCreators(stageActions.previous, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Stage);

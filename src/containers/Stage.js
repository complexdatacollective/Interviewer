import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { actionCreators as stageActions } from '../ducks/modules/stage';
import { stage } from '../selectors/session';

import { NameGenerator } from './Interfaces';

/**
  * Render a protocol interface based on protocol info and id
  * @extends Component
  */
class Stage extends Component {
  // change the stage to the next
  handleNext = () => {
    this.props.next();
  }

  // change the stage to the previous
  handlePrevious = () => {
    this.props.previous();
  }

  render() {
    // TODO: Load dynamically based on protocol using some kind of service?
    const CurrentInterface = NameGenerator;

    return (
      <div className="stage">
        <div className="stage__control">
          <button
            className="stage__control-button stage__control-button--back"
            onClick={this.handleNext}
          >
            Back
          </button>
        </div>
        <div className="stage__interface">
          <CurrentInterface config={this.props.currentStage} />
        </div>
        <div className="stage__control">
          <button
            className="stage__control-button stage__control-button--next"
            onClick={this.handlePrevious}
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
    onStageClick: bindActionCreators(stageActions.setStage, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Stage);

import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Link } from 'react-router';

import { actionCreators as stageActions } from '../ducks/modules/stage';
import { getStages } from '../selectors/session';

import { NameGenerator } from './Interfaces';

/**
  * Render a protocol interface based on protocol info and index
  */
class Stage extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    // TODO: Load dynamically based on protocol using some kind of service?
    const CurrentInterface = NameGenerator;

    return (
      <div className="stage">
        <div className="stage__control">
          <Link
            to={'/protocol/' + this.props.prevLink}
            className="stage__control-button stage__control-button--back"
            onClick={() => this.props.onStageClick(this.props.stages, this.props.prevLink)}
          >
            Back
          </Link>
        </div>
        <div className="stage__interface">
          <CurrentInterface config={ this.props.stage }/>
        </div>
        <div className="stage__control">
          <Link
            to={'/protocol/' + this.props.nextLink}
            className="stage__control-button stage__control-button--next"
            onClick={() => this.props.onStageClick(this.props.stages, this.props.nextLink)}
          >
            Next
          </Link>
        </div>
      </div>
    );
  }
}

const rotateIndex = (max, next) => {
  return (next + max) % max;
}

function mapStateToProps(state, ownProps) {
  const stages = getStages(state);
  const stage = stages.find(stage => stage.id === ownProps.id) || stages[0];
  const stageIndex = stages.indexOf(stage);
  const prevLink = stages[rotateIndex(stages.length, stageIndex - 1)].id;
  const nextLink = stages[rotateIndex(stages.length, stageIndex + 1)].id;

  return {
    stages,
    stage,
    prevLink,
    nextLink
  }
}

function mapDispatchToProps(dispatch) {
  return {
    onStageClick: bindActionCreators(stageActions.setStage, dispatch),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Stage);

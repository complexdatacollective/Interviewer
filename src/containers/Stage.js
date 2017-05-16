import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Link } from 'react-router';

import { actionCreators as stageActions } from '../ducks/modules/stage';
import { getStages } from '../selectors/session';

import { NameGenerator } from './Interfaces';

/**
  * Render a protocol interface based on protocol info and id
  */
function Stage(props) {
  // TODO: Load dynamically based on protocol using some kind of service?
  const CurrentInterface = NameGenerator;

  return (
    <div className="stage">
      <div className="stage__control">
        <Link
          to={`/protocol/${props.prevLink}`}
          className="stage__control-button stage__control-button--back"
          onClick={() => props.onStageClick(props.stages, props.prevLink)}
        >
          Back
        </Link>
      </div>
      <div className="stage__interface">
        <CurrentInterface config={props.stage} />
      </div>
      <div className="stage__control">
        <Link
          to={`/protocol/${props.nextLink}`}
          className="stage__control-button stage__control-button--next"
          onClick={() => props.onStageClick(props.stages, props.nextLink)}
        >
          Next
        </Link>
      </div>
    </div>
  );
}

const rotateIndex = (max, next) => (next + max) % max;

Stage.propTypes = {
  stage: PropTypes.object.isRequired,
  onStageClick: PropTypes.func.isRequired,
  stages: PropTypes.array.isRequired,
  prevLink: PropTypes.string.isRequired,
  nextLink: PropTypes.string.isRequired,
};

function mapStateToProps(state, ownProps) {
  const stages = getStages(state);
  const stage = stages.find(currentStage => currentStage.id === ownProps.id) || stages[0];
  const stageIndex = stages.indexOf(stage);
  const prevLink = stages[rotateIndex(stages.length, stageIndex - 1)].id;
  const nextLink = stages[rotateIndex(stages.length, stageIndex + 1)].id;

  return {
    stages,
    stage,
    prevLink,
    nextLink,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    onStageClick: bindActionCreators(stageActions.setStage, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Stage);

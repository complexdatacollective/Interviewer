import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Link } from 'react-router';

import { actionCreators as stageActions } from '../ducks/modules/stage';
import { stages } from '../selectors/session';

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
          to={`/protocol/${props.previousLink}`}
          className="stage__control-button stage__control-button--back"
          onClick={() => props.onStageClick(props.currentStages, props.previousLink)}
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
          onClick={() => props.onStageClick(props.currentStages, props.nextLink)}
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
  currentStages: PropTypes.array.isRequired,
  previousLink: PropTypes.string.isRequired,
  nextLink: PropTypes.string.isRequired,
};

function mapStateToProps(state, ownProps) {
  const currentStages = stages(state);
  const stage = currentStages.find(currentStage => currentStage.id === ownProps.id)
    || currentStages[0];
  const stageIndex = currentStages.indexOf(stage);
  const previousLink = currentStages[rotateIndex(currentStages.length, stageIndex - 1)].id;
  const nextLink = currentStages[rotateIndex(currentStages.length, stageIndex + 1)].id;

  return {
    currentStages,
    stage,
    previousLink,
    nextLink,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    onStageClick: bindActionCreators(stageActions.setStage, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Stage);

import React, { Component } from 'react';
import { compose } from 'redux';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { findIndex } from 'lodash';

import { Icon } from '../ui/components';
import withPrompt from '../behaviours/withPrompt';
import getInterface from './Interfaces';
import { ProgressBar } from '../components';
import StageErrorBoundary from '../components/StageErrorBoundary';
import { stages } from '../selectors/session';

/**
  * Render a protocol interface based on protocol info and id
  * @extends Component
  */
class Stage extends Component {
  // change the stage to the next
  onClickNext = () => {
    if (!this.props.stage.prompts || this.props.isLastPrompt()) {
      this.props.changeStage(`${this.props.pathPrefix}/${this.props.nextIndex}`);
    } else {
      this.props.promptForward();
    }
  }

  // change the stage to the previous
  onClickBack = () => {
    if (!this.props.stage.prompts || this.props.isFirstPrompt()) {
      this.props.changeStage(`${this.props.pathPrefix}/${this.props.previousIndex}?back`);
    } else {
      this.props.promptBackward();
    }
  }

  render() {
    const { stage, percentProgress, promptId } = this.props;
    const CurrentInterface = getInterface(stage.type);

    return (
      <div className="stage">
        <div className="stage__control">
          <div className="stage__control-nav stage__control-nav--back">
            <Icon onClick={this.onClickBack} name="chevron-up" />
          </div>
          <ProgressBar percentProgress={percentProgress} />
          <div className="stage__control-nav stage__control-nav--next">
            <Icon onClick={this.onClickNext} name="chevron-down" />
          </div>
        </div>
        <div className="stage__interface">
          <StageErrorBoundary>
            { CurrentInterface &&
              <CurrentInterface stage={stage} promptId={promptId} />
            }
          </StageErrorBoundary>
        </div>
      </div>
    );
  }
}

Stage.propTypes = {
  changeStage: PropTypes.func.isRequired,
  stage: PropTypes.object.isRequired,
  nextIndex: PropTypes.number.isRequired,
  pathPrefix: PropTypes.string,
  previousIndex: PropTypes.number.isRequired,
  isLastPrompt: PropTypes.func.isRequired,
  isFirstPrompt: PropTypes.func.isRequired,
  promptBackward: PropTypes.func.isRequired,
  promptForward: PropTypes.func.isRequired,
  promptId: ProgressBar.number,
  percentProgress: PropTypes.number,
};

Stage.defaultProps = {
  percentProgress: 0,
  pathPrefix: '',
  promptId: 0,
};

function mapStateToProps(state, ownProps) {
  const rotateIndex = (max, nextIndex) => (nextIndex + max) % max;
  const maxLength = stages(state).length;

  const stageProgress = ownProps.stageIndex / maxLength;
  const promptProgress = ownProps.stage.prompts ?
    (findIndex(ownProps.stage.prompts, ownProps.prompt) / ownProps.stage.prompts.length) : 0;

  return {
    nextIndex: rotateIndex(maxLength, ownProps.stageIndex + 1),
    previousIndex: rotateIndex(maxLength, ownProps.stageIndex - 1),
    percentProgress: (stageProgress + (promptProgress / maxLength)) * 100,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    changeStage: path => dispatch(push(path)),
  };
}

export default compose(
  withPrompt,
  connect(mapStateToProps, mapDispatchToProps),
)(Stage);

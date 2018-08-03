import React, { Component } from 'react';
import { compose } from 'redux';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';

import withPrompt from '../behaviours/withPrompt';
import getInterface from './Interfaces';
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
    const { stage } = this.props;
    const CurrentInterface = getInterface(stage.type);

    return (
      <div className="stage">
        <div className="stage__control">
          <button
            className="stage__control-button stage__control-button--back"
            onClick={this.onClickBack}
          >
            Back
          </button>
          <button
            className="stage__control-button stage__control-button--next"
            onClick={this.onClickNext}
          >
            Next
          </button>
        </div>
        <div className="stage__interface">
          <StageErrorBoundary>
            { CurrentInterface &&
              <CurrentInterface stage={stage} />
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
};

Stage.defaultProps = {
  pathPrefix: '',
};

function mapStateToProps(state, ownProps) {
  const rotateIndex = (max, nextIndex) => (nextIndex + max) % max;
  const maxLength = stages(state).length;

  return {
    nextIndex: rotateIndex(maxLength, ownProps.stageIndex + 1),
    previousIndex: rotateIndex(maxLength, ownProps.stageIndex - 1),
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

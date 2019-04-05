import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { TransitionGroup } from 'react-transition-group';
import { push } from 'react-router-redux';
import { isStageSkipped } from '../selectors/skip-logic';
import withPrompt from '../behaviours/withPrompt';
import { Timeline } from '../components';
import { Stage as StageTransition } from '../components/Transition';
import { Fade } from '../ui/components/Transitions';
import Stage from './Stage';
import { getPromptIndexForCurrentSession } from '../selectors/session';
import { getProtocolStages } from '../selectors/protocol';
import { getCSSVariableAsNumber } from '../ui/utils/CSSVariables';

/**
  * Check protocol is loaded, and render the stage
  */
class Protocol extends Component {
  constructor(props) {
    super(props);
    this.interfaceRef = React.createRef();
  }

  componentDidUpdate(previousProps) {
    if (previousProps.stage.id !== this.props.stage.id) {
      this.interfaceRef = React.createRef();
      this.forceUpdate();
    }
  }

  // change the stage to the next
  onClickNext = () => {
    const interfaceRefInstance = this.getInterfaceRefInstance();
    if (interfaceRefInstance && !interfaceRefInstance.isStageEnding()) {
      interfaceRefInstance.clickNext();
    } else if (!this.props.stage.prompts || this.props.isLastPrompt()) {
      if (interfaceRefInstance) {
        interfaceRefInstance.clickNext();
      }

      let skipToIndex = this.props.nextIndex;

      while (this.props.isSkipped(skipToIndex)) {
        skipToIndex += 1;
      }

      this.props.changeStage(`${this.props.pathPrefix}/${skipToIndex}`);
    } else {
      this.props.promptForward();
    }
  }

  // change the stage to the previous
  onClickBack = () => {
    const interfaceRefInstance = this.getInterfaceRefInstance();
    if (interfaceRefInstance && !interfaceRefInstance.isStageBeginning()) {
      interfaceRefInstance.clickPrevious();
    } else if (!this.props.stage.prompts || this.props.isFirstPrompt()) {
      if (interfaceRefInstance) {
        interfaceRefInstance.clickPrevious();
      }

      let skipToIndex = this.props.previousIndex;

      while (this.props.isSkipped(skipToIndex)) {
        skipToIndex -= 1;
      }
      this.props.changeStage(`${this.props.pathPrefix}/${skipToIndex}`);
    } else {
      this.props.promptBackward();
    }
  }

  /*
   * Typically an interface would iterate through "prompts" via clicking back and forward.
   * If an interface needs a different iterative process, (e.g. iterating through a list
   * of nodes instead of prompts), the interface can be accessed here as a ref.
   *
   * Expected callbacks:
   * isStageEnding - boolean indicating the end of the stage
   * isStageBeginning - boolean indicating the beginning of the stage
   * clickNext - callback for the stage's "next" behavior; also called on stage end transition
   * clickPrevious - callback for the stage's "back" behavior
   */
  getInterfaceRefInstance = () => {
    try {
      return (this.interfaceRef && this.interfaceRef.current &&
        this.interfaceRef.current.getWrappedInstance());
    } catch (e) {
      return false;
    }
  }

  childFactoryCreator = stageBackward => (
    child => (React.cloneElement(child, { stageBackward }))
  );

  render() {
    const {
      isSessionLoaded,
      pathPrefix,
      percentProgress,
      promptId,
      stage,
      stageBackward,
      stageIndex,
    } = this.props;

    if (!isSessionLoaded) { return null; }

    const duration = {
      enter: getCSSVariableAsNumber('--animation-duration-slow-ms') * 2,
      exit: getCSSVariableAsNumber('--animation-duration-slow-ms'),
    };

    return (
      <div className="protocol">
        <Fade in={isSessionLoaded} duration={duration}>
          <Timeline
            id="TIMELINE"
            onClickBack={this.onClickBack}
            onClickNext={this.onClickNext}
            percentProgress={percentProgress}
          />
        </Fade>
        <TransitionGroup
          className="protocol__content"
          childFactory={this.childFactoryCreator(stageBackward)}
        >
          <StageTransition key={stage.id} stageBackward={stageBackward}>
            <Stage
              stage={stage}
              promptId={promptId}
              pathPrefix={pathPrefix}
              stageIndex={stageIndex}
              ref={this.interfaceRef}
            />
          </StageTransition>
        </TransitionGroup>
      </div>
    );
  }
}

Protocol.propTypes = {
  changeStage: PropTypes.func.isRequired,
  isFirstPrompt: PropTypes.func.isRequired,
  isLastPrompt: PropTypes.func.isRequired,
  isSkipped: PropTypes.func.isRequired,
  isSessionLoaded: PropTypes.bool.isRequired,
  nextIndex: PropTypes.number.isRequired,
  pathPrefix: PropTypes.string,
  percentProgress: PropTypes.number,
  previousIndex: PropTypes.number.isRequired,
  promptBackward: PropTypes.func.isRequired,
  promptForward: PropTypes.func.isRequired,
  promptId: PropTypes.number,
  stage: PropTypes.object.isRequired,
  stageBackward: PropTypes.bool,
  stageIndex: PropTypes.number,
};

Protocol.defaultProps = {
  pathPrefix: '',
  percentProgress: 0,
  promptId: 0,
  stageBackward: false,
  stageIndex: 0,
};

function mapStateToProps(state, ownProps) {
  const rotateIndex = (max, nextIndex) => (nextIndex + max) % max;
  const maxLength = getProtocolStages(state).length;
  const sessionId = state.activeSessionId;
  const stage = getProtocolStages(state)[ownProps.stageIndex] || {};
  const stageIndex = Math.trunc(ownProps.stageIndex) || 0;
  const promptId = getPromptIndexForCurrentSession(state);
  const stageProgress = stageIndex / (maxLength - 1);
  const promptProgress = stage.prompts ? (promptId / stage.prompts.length) : 0;

  return {
    isSessionLoaded: !!state.activeSessionId,
    nextIndex: rotateIndex(maxLength, stageIndex + 1),
    pathPrefix: `/session/${sessionId}`,
    isSkipped: index => isStageSkipped(index)(state),
    percentProgress: (stageProgress + (promptProgress / (maxLength - 1))) * 100,
    previousIndex: rotateIndex(maxLength, stageIndex - 1),
    promptId,
    stage,
    stageIndex,
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
)(Protocol);

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { TransitionGroup } from 'react-transition-group';
// import withPrompt from '../behaviours/withPrompt';
import { Timeline } from '../components';
import { Stage as StageTransition } from '../components/Transition';
import { Fade } from '../ui/components/Transitions';
import Stage from './Stage';
import { getPromptIndexForCurrentSession } from '../selectors/session';
import { getProtocolStages } from '../selectors/protocol';
import { getCSSVariableAsNumber } from '../ui/utils/CSSVariables';
import { actionCreators as navigateActions } from '../ducks/modules/navigate';

const initialState = {
  completeDirection: 1,
};

/**
  * Check protocol is loaded, and render the stage
  */
class Protocol extends Component {
  constructor(props) {
    super(props);
    this.interfaceRef = React.createRef();
    this.state = {
      ...initialState,
    };
  }

  componentDidUpdate(previousProps) {
    if (previousProps.stage.id !== this.props.stage.id) {
      this.interfaceRef = React.createRef();
      this.forceUpdate();
    }
  }

  onClickNext = () =>
    this.goToNext();

  onClickBack = () =>
    this.goToNext(-1);

  onComplete = () => {
    const completeDirection = this.state.completeDirection;
    const goToNext = this.props.goToNext;

    this.setState(
      { ...initialState },
      () => {
        goToNext(completeDirection);
      },
    );

    // debugger;
  };

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

  getBeforeNextHandler = () => {
    const interfaceRefInstance = this.getInterfaceRefInstance();

    return interfaceRefInstance && interfaceRefInstance.beforeNext;
  }

  childFactoryCreator = stageBackward =>
    child =>
      React.cloneElement(child, { stageBackward });

  goToNext = (direction = 1) => {
    const beforeNext = this.getBeforeNextHandler();

    if (!beforeNext) {
      return this.props.goToNext(direction);
    }

    this.setState(
      { completeDirection: direction },
      beforeNext,
    );
  };

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
              onComplete={this.onComplete}
            />
          </StageTransition>
        </TransitionGroup>
      </div>
    );
  }
}

Protocol.propTypes = {
  isSessionLoaded: PropTypes.bool.isRequired,
  pathPrefix: PropTypes.string,
  percentProgress: PropTypes.number,
  promptId: PropTypes.number,
  stage: PropTypes.object.isRequired,
  stageBackward: PropTypes.bool,
  stageIndex: PropTypes.number,
  goToNext: PropTypes.func.isRequired,
};

Protocol.defaultProps = {
  pathPrefix: '',
  percentProgress: 0,
  promptId: 0,
  stageBackward: false,
  stageIndex: 0,
  maxLength: 1,
};

function mapStateToProps(state, ownProps) {
  const maxLength = getProtocolStages(state).length;
  const sessionId = state.activeSessionId;
  const stage = getProtocolStages(state)[ownProps.stageIndex] || {};
  const stageIndex = Math.trunc(ownProps.stageIndex) || 0;
  const promptId = getPromptIndexForCurrentSession(state);
  // TODO: make this a selector?
  const stageProgress = stageIndex / (maxLength - 1);
  const promptProgress = stage.prompts ? (promptId / stage.prompts.length) : 0;
  const percentProgress = (stageProgress + (promptProgress / (maxLength - 1))) * 100;

  return {
    isSessionLoaded: !!state.activeSessionId,
    pathPrefix: `/session/${sessionId}`,
    percentProgress,
    promptId,
    stage,
    stageIndex,
  };
}

const mapDispatchToProps = {
  goToNext: navigateActions.goToNext,
};

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
)(Protocol);

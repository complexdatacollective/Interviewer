import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { TransitionGroup } from 'react-transition-group';
import { Timeline } from '../components';
import { Stage as StageTransition } from '../components/Transition';
import { Fade } from '../ui/components/Transitions';
import Stage from './Stage';
import { getSessionProgress } from '../selectors/session';
import { getProtocolStages } from '../selectors/protocol';
import { getCSSVariableAsNumber } from '../ui/utils/CSSVariables';
import { actionCreators as navigateActions } from '../ducks/modules/navigate';

const initialState = {
  pendingDirection: 1,
};

const childFactoryCreator = stageBackward =>
  child =>
    React.cloneElement(child, { stageBackward });

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

  onComplete = () => {
    const pendingDirection = this.state.pendingDirection;
    const goToNext = this.props.goToNext;

    this.setState(
      { ...initialState },
      () => {
        goToNext(pendingDirection);
      },
    );
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

  goToNext = (direction = 1) => {
    const beforeNext = this.getBeforeNextHandler();

    if (!beforeNext) {
      this.props.goToNext(direction);
      return;
    }

    this.setState(
      { pendingDirection: direction },
      () => beforeNext(direction),
    );
  };

  handleClickNext = () =>
    this.goToNext();

  handleClickBack = () =>
    this.goToNext(-1);

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
            onClickBack={this.handleClickBack}
            onClickNext={this.handleClickNext}
            percentProgress={percentProgress}
          />
        </Fade>
        <TransitionGroup
          className="protocol__content"
          childFactory={childFactoryCreator(stageBackward)}
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
};

function mapStateToProps(state, ownProps) {
  const sessionId = state.activeSessionId;
  const stage = getProtocolStages(state)[ownProps.stageIndex] || {};
  const stageIndex = Math.trunc(ownProps.stageIndex) || 0;
  const { percentProgress, currentPrompt } = getSessionProgress(state);

  return {
    isSessionLoaded: !!state.activeSessionId,
    pathPrefix: `/session/${sessionId}`,
    percentProgress,
    promptId: currentPrompt,
    stage,
    stageIndex,
  };
}

const mapDispatchToProps = {
  goToNext: navigateActions.goToNext,
};

const withStore = connect(mapStateToProps, mapDispatchToProps);

export default withStore(Protocol);

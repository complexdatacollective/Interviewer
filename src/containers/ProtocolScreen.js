import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { TransitionGroup } from 'react-transition-group';
import { get } from 'lodash';
import { Fade } from '@codaco/ui/lib/components/Transitions';
import { getCSSVariableAsNumber } from '@codaco/ui/lib/utils/CSSVariables';
import { Timeline } from '../components';
import { Stage as StageTransition } from '../components/Transition';
import Stage from './Stage';
import { getSessionProgress } from '../selectors/session';
import { isStageSkipped } from '../selectors/skip-logic';
import { getProtocolStages } from '../selectors/protocol';
import { actionCreators as navigateActions } from '../ducks/modules/navigate';
import { actionCreators as dialogActions } from '../ducks/modules/dialogs';

const initialState = {
  pendingDirection: 1,
  pendingStage: -1,
};

const childFactoryCreator = (stageBackward) => (child) => React.cloneElement(child, { stageBackward });

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
    this.beforeNext = {};
  }

  onComplete = (directionOverride) => {
    const pendingDirection = directionOverride || this.state.pendingDirection;
    const { pendingStage } = this.state;

    const navigate = (pendingStage === -1)
      ? () => this.props.goToNext(pendingDirection)
      : () => this.goToStage(pendingStage);
    this.setState(
      { ...initialState },
      navigate,
    );
  };

  registerBeforeNext = (beforeNext, stageId) => {
    if (beforeNext === null) {
      delete this.beforeNext[stageId];
      return;
    }

    this.beforeNext[stageId] = beforeNext;
  }

  goToNext = (direction = 1) => {
    const beforeNext = get(this.beforeNext, this.props.stage.id);

    if (!beforeNext) {
      this.props.goToNext(direction);
      return;
    }

    this.setState(
      { pendingStage: -1, pendingDirection: direction },
      () => beforeNext(direction),
    );
  };

  goToStage = (index) => {
    if (this.props.isSkipped(index)) {
      this.props.openDialog({
        type: 'Warning',
        title: 'Show this stage?',
        confirmLabel: 'Show Stage',
        onConfirm: () => this.props.goToStage(index),
        message: (
          <p>
            Your skip logic settings would normally prevent this stage from being shown in this
            interview. Do you want to show it anyway?
          </p>
        ),
      });
    } else {
      this.props.goToStage(index);
    }
  }

  handleClickNext = () => this.goToNext();

  handleClickBack = () => this.goToNext(-1);

  handleStageSelect = (index) => {
    if (index === this.props.stageIndex) return;

    const beforeNext = get(this.beforeNext, this.props.stage.id);

    if (!beforeNext) {
      this.goToStage(index);
      return;
    }

    const direction = (this.props.stageIndex > index) ? -1 : 1;
    this.setState(
      { pendingStage: index, pendingDirection: direction },
      () => beforeNext(direction, index),
    );
  }

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
      exit: getCSSVariableAsNumber('--animation-duration-slow-ms') * 2,
    };

    return (
      <div className="protocol">
        <Fade in={isSessionLoaded} duration={duration}>
          <Timeline
            id="TIMELINE"
            onClickBack={this.handleClickBack}
            onClickNext={this.handleClickNext}
            onStageSelect={this.handleStageSelect}
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
              registerBeforeNext={this.registerBeforeNext}
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
    isSkipped: (index) => isStageSkipped(index)(state),
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
  goToStage: navigateActions.goToStage,
  openDialog: dialogActions.openDialog,
};

const withStore = connect(mapStateToProps, mapDispatchToProps);

export default withStore(Protocol);

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose, bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { TransitionGroup } from 'react-transition-group';
import { push } from 'react-router-redux';

import { actionCreators as menuActions } from '../ducks/modules/menu';
import withPrompt from '../behaviours/withPrompt';
import { Timeline } from '../components';
import { Fade, Stage as StageTransition } from '../components/Transition';
import Stage from './Stage';
import { stages, getPromptForCurrentSession } from '../selectors/session';
import { getCSSVariableAsNumber } from '../utils/CSSVariables';

/**
  * Check protocol is loaded, and render the stage
  */
class Protocol extends Component {
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

  childFactoryCreator = stageBackward => (
    child => (React.cloneElement(child, { stageBackward }))
  );

  render() {
    const {
      isProtocolLoaded,
      pathPrefix,
      percentProgress,
      promptId,
      stage,
      stageBackward,
      stageIndex,
      toggleMenu,
    } = this.props;

    if (!isProtocolLoaded) { return null; }

    const duration = {
      enter: getCSSVariableAsNumber('--animation-duration-slow-ms') * 2,
      exit: getCSSVariableAsNumber('--animation-duration-slow-ms'),
    };

    return (
      <div className="protocol">
        <Fade in={isProtocolLoaded} duration={duration}>
          <Timeline
            id="TIMELINE"
            onClickBack={this.onClickBack}
            onClickNext={this.onClickNext}
            percentProgress={percentProgress}
            toggleMenu={toggleMenu}
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
  isProtocolLoaded: PropTypes.bool.isRequired,
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
  toggleMenu: PropTypes.func.isRequired,
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
  const maxLength = stages(state).length;
  const sessionId = state.session;
  const protocolPath = state.protocol.path;
  const protocolType = state.protocol.type;
  const stage = stages(state)[ownProps.stageIndex] || {};
  const stageIndex = Math.trunc(ownProps.stageIndex) || 0;
  const promptId = getPromptForCurrentSession(state);
  const stageProgress = stageIndex / (maxLength - 1);
  const promptProgress = stage.prompts ? (promptId / stage.prompts.length) : 0;

  return {
    isProtocolLoaded: state.protocol.isLoaded,
    nextIndex: rotateIndex(maxLength, stageIndex + 1),
    pathPrefix: `/session/${sessionId}/${protocolType}/${protocolPath}`,
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
    toggleMenu: bindActionCreators(menuActions.toggleStageMenu, dispatch),
  };
}

export default compose(
  withPrompt,
  connect(mapStateToProps, mapDispatchToProps),
)(Protocol);

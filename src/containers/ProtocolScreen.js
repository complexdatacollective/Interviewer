import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { TransitionGroup } from 'react-transition-group';
import { push } from 'react-router-redux';

import withPrompt from '../behaviours/withPrompt';
import { Timeline } from '../components';
import { Stage as StageTransition } from '../components/Transition';
import Stage from './Stage';
import { stages, getPromptForCurrentSession } from '../selectors/session';

/**
  * Check protocol is loaded, and render the stage
  */
class Protocol extends Component {
  constructor(props) {
    super(props);
    this.state = {
      stageBackward: false,
    };
  }

  // change the stage to the next
  onClickNext = () => {
    if (!this.props.stage.prompts || this.props.isLastPrompt()) {
      this.setState({
        stageBackward: false,
      });
      this.props.changeStage(`${this.props.pathPrefix}/${this.props.nextIndex}`);
    } else {
      this.props.promptForward();
    }
  }

  // change the stage to the previous
  onClickBack = () => {
    if (!this.props.stage.prompts || this.props.isFirstPrompt()) {
      this.setState({
        stageBackward: true,
      });
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
      stageIndex,
    } = this.props;

    if (!isProtocolLoaded) { return null; }

    console.log(this.state.stageBackward);

    return (
      <div className="protocol">
        <Timeline
          onClickBack={this.onClickBack}
          onClickNext={this.onClickNext}
          percentProgress={percentProgress}
        />
        <TransitionGroup
          className="protocol__content"
          childFactory={this.childFactoryCreator(this.state.stageBackward)}
        >
          <StageTransition key={stage.id} stageBackward={this.state.stageBackward}>
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
  stageIndex: PropTypes.number,
};

Protocol.defaultProps = {
  pathPrefix: '',
  percentProgress: 0,
  promptId: 0,
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
  };
}

export default compose(
  withPrompt,
  connect(mapStateToProps, mapDispatchToProps),
)(Protocol);

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import getInterface from './Interfaces';
import StageErrorBoundary from '../components/StageErrorBoundary';

/**
  * Render a protocol interface based on protocol info and id
  * @extends Component
  */
class Stage extends Component {
  componentWillUnmount() {
    this.props.registerBeforeNext(null, this.props.stage.id);
  }

  registerBeforeNext = (beforeNext) => this.props.registerBeforeNext(beforeNext, this.props.stage.id)

  render() {
    const { stage, registerBeforeNext, ...props } = this.props;

    const CurrentInterface = getInterface(stage.type);

    return (
      <div className="stage">
        <div className="stage__interface">
          <StageErrorBoundary>
            { CurrentInterface
              && (
              <CurrentInterface
                {...props}
                registerBeforeNext={this.registerBeforeNext}
                stage={stage}
                key={stage.id}
              />
              )}
          </StageErrorBoundary>
        </div>
      </div>
    );
  }
}

Stage.propTypes = {
  stage: PropTypes.object.isRequired,
  promptId: PropTypes.number,
};

Stage.defaultProps = {
  promptId: 0,
};

export default Stage;

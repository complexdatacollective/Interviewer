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
    const { registerBeforeNext, stage: { id } } = this.props;
    registerBeforeNext(null, id);
  }

  registerBeforeNext = (beforeNext) => {
    const { registerBeforeNext, stage: { id } } = this.props;
    registerBeforeNext(
      beforeNext,
      id,
    );
  }

  render() {
    const { stage, registerBeforeNext, ...props } = this.props;

    const CurrentInterface = getInterface(stage.type);

    return (
      <div className="stage">
        <div className="stage__interface">
          <StageErrorBoundary>
            {CurrentInterface
              && (
                <CurrentInterface
                  {...props} // eslint-disable-line react/jsx-props-no-spreading
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

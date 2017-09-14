import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default function withPrompt(WrappedComponent) {
  class WithPrompt extends Component {
    constructor(props) {
      super(props);

      this.state = {
        promptIndex: props.promptIndex,
      };
    }

    prompts() {
      return this.props.stage.params.prompts;
    }

    promptsCount() {
      return this.prompts().length;
    }

    prompt() {
      return this.prompts()[this.state.promptIndex];
    }

    promptForward = () => {
      this.setState({
        promptIndex: (this.promptsCount() + this.state.promptIndex + 1) % this.promptsCount(),
      });
    }

    promptBackward = () => {
      this.setState({
        promptIndex: (this.promptsCount() + this.state.promptIndex - 1) % this.promptsCount(),
      });
    }

    render() {
      const { promptIndex, ...rest } = this.props;

      return (
        <WrappedComponent
          prompt={this.prompt()}
          promptForward={this.promptForward}
          promptBackward={this.promptBackward}
          {...rest}
        />
      );
    }
  }
  WithPrompt.propTypes = {
    stage: PropTypes.object.isRequired,
    promptIndex: PropTypes.number,
  };

  WithPrompt.defaultProps = {
    promptIndex: 0,
  };

  return WithPrompt;
}

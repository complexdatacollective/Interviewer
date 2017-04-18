import React, { Component } from 'react';

class Prompt extends Component {
  render() {

    const {
      prompt,
      isActive
    } = this.props;

    return (
      <div className={ isActive ? 'prompts__prompt prompts__prompt--active' : 'prompts__prompt' }>
        <h3>{ prompt.title }</h3>
      </div>
    );
  }
}

export default Prompt;

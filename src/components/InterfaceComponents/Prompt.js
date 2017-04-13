import React, { Component } from 'react';

class Prompt extends Component {
  currentPrompt() {
    const {
      prompts,
      currentIndex
    } = this.props;

    return prompts[currentIndex];
  }

  render() {
    const {
      title
    } = this.currentPrompt();

    return (
      <div className='prompt'>Current prompt: { title }</div>
    );
  }
}

export default Prompt;

import React, { Component } from 'react';
import Touch from 'react-hammerjs';

class Prompt extends Component {
  currentPrompt() {
    const {
      prompts,
      currentIndex
    } = this.props;

    return prompts[currentIndex];
  }

  render() {
    console.log('prompt', this.props);

    const {
      title
    } = this.currentPrompt();

    const {
      handleTap,
      handleSwipe
    } = this.props;

    return (
      <div>
      <Touch onTap={ handleTap } onSwipe={ handleSwipe } >
        <div className='prompt'>Current prompt: { title }</div>
      </Touch>
      </div>
    );
  }
}

export default Prompt;

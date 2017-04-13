import React, { Component } from 'react';
import Touch from 'react-hammerjs';

class Prompt extends Component {
  constructor(props) {
     super(props);

     this.handleTap = this.handleTap.bind(this);
     this.handleSwipe = this.handleSwipe.bind(this);
   }

  currentPrompt() {
    const {
      prompts,
      currentIndex
    } = this.props;

    return prompts[currentIndex];
  }

  handleSwipe(event) {
    if(event.direction === 2) {
      this.next();
    }
  }

  handleTap() {
    this.next();
  }

  next() {
    alert('next');
  }

  render() {
    const {
      title
    } = this.currentPrompt();

    return (
      <Touch onTap={this.handleTap} onSwipe={this.handleSwipe} >
        <div className='prompt'>Current prompt: { title }</div>
      </Touch>
    );
  }
}

export default Prompt;

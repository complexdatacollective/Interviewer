import React, { Component } from 'react';
import Touch from 'react-hammerjs';

const promptClasses = (index, currentIndex) => {
  return currentIndex === index ? 'prompt__prompt prompt__prompt--active' : 'prompt__prompt';
}

class Prompt extends Component {
  render() {

    const {
      prompts,
      currentIndex,
      handleTap,
      handleSwipe
    } = this.props;

    return (
      <Touch onTap={ handleTap } onSwipe={ handleSwipe } >
        <div className='prompt'>
          <div className='prompt__prompts'>
            { prompts.map((prompt, index) => {

              return (
                <div className={ promptClasses(index, currentIndex) }>
                  { prompt.title }
                </div>
              );
            }) }
          </div>
        </div>
      </Touch>
    );
  }
}

export default Prompt;

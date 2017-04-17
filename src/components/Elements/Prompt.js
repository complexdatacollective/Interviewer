import React, { Component } from 'react';
import Touch from 'react-hammerjs';
import Pips from './Pips';

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
                <div key={ index } className={ promptClasses(index, currentIndex) }>
                  <h3>{ prompt.title }</h3>
                </div>
              );
            }) }
          </div>

          <div className='prompt__pips'>
            <Pips count={ prompts.length } currentIndex={ currentIndex } />
          </div>
        </div>
      </Touch>
    );
  }
}

export default Prompt;

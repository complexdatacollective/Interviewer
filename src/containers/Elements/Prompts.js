import React, { Component } from 'react';
import Touch from 'react-hammerjs';

import { Prompt, Pips } from '../../components/Elements';

class Prompts extends Component {
  constructor(props) {
    super(props);

    this.handleTap = this.handleTap.bind(this);
    this.handleSwipe = this.handleSwipe.bind(this);
  }

  handleSwipe(event) {
    switch(event.direction) {
      case 2:
      case 3:
        this.props.handleNext();
        break;
      case 1:
      case 4:
        this.props.handlePrevious();
        break;
    }
  }

  handleTap() {
    this.props.handleNext();
  }

  render() {
    const {
      promptIndex,
      prompts
    } = this.props;

    return (
      <Touch onTap={ this.handleTap } onSwipe={ this.handleSwipe } >
        <div className='prompts'>
          <div className='prompts__prompts'>
            { prompts.map((prompt, index) => {
              return <Prompt key={ index } prompt={ prompt } isActive={ promptIndex == index } />;
            }) }
          </div>

          <div className='prompts__pips'>
            <Pips count={ prompts.length } currentIndex={ promptIndex } />
          </div>
        </div>
      </Touch>
    );
  }
}

export default Prompts;

import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Touch from 'react-hammerjs';

import { actionCreators as promptActions } from '../../ducks/modules/prompt';

import { Prompt, Pips } from '../../components/Elements';

class PromptSwiper extends Component {
  constructor(props) {
    super(props);

    this.handleTap = this.handleTap.bind(this);
    this.handleSwipe = this.handleSwipe.bind(this);
  }

  handleSwipe(event) {
    switch (event.direction) {
      case 2:
      case 3:
        this.props.next();
        break;
      case 1:
      case 4:
        this.props.previous();
        break;
    }
  }

  handleTap() {
    this.props.next();
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
              return <Prompt key={ index } label={ prompt.title } isActive={ promptIndex == index } />;
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

function mapStateToProps(state, ownProps) {
  return {
    promptIndex: state.session.prompt.index,
  }
}

function mapDispatchToProps(dispatch) {
  return {
    next: bindActionCreators(promptActions.next, dispatch),
    previous: bindActionCreators(promptActions.previous, dispatch),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(PromptSwiper);

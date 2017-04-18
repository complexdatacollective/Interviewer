import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Touch from 'react-hammerjs';

import { actionCreators as sessionActions } from '../../ducks/modules/session';

import { Prompt, Pips } from '../../components/Elements';

class Prompts extends Component {
  constructor(props) {
    super(props);

    this.handleTap = this.handleTap.bind(this);
    this.handleSwipe = this.handleSwipe.bind(this);
  }

  handleSwipe(event) {
    if(event.direction === 2) {
      this.props.nextPrompt();
    }
  }

  handleTap() {
    this.props.nextPrompt();
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

function mapStateToProps(state) {
  return {
    promptIndex: state.session.promptIndex
  }
}

function mapDispatchToProps(dispatch) {
  return {
    nextPrompt: bindActionCreators(sessionActions.nextPrompt, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Prompts);

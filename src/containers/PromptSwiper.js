import React, { Component } from 'react';
import { connect } from 'react-redux';
import Touch from 'react-hammerjs';
import PropTypes from 'prop-types';
import { findIndex } from 'lodash';
import cx from 'classnames';
import { Prompt, Pips } from '../components/';

/**
  * Displays a control to swipe through prompts
  * @extends Component
  */
class PromptSwiper extends Component {
  static propTypes = {
    forward: PropTypes.func.isRequired,
    backward: PropTypes.func.isRequired,
    prompts: PropTypes.any.isRequired,
    promptIndex: PropTypes.number.isRequired,
    floating: PropTypes.bool,
  };

  static defaultProps = {
    floating: false,
  };

  constructor(props) {
    super(props);

    this.handleTap = this.handleTap.bind(this);
    this.handleSwipe = this.handleSwipe.bind(this);
  }

  handleSwipe(event) {
    switch (event.direction) {
      case 2:
      case 3:
        this.props.forward();
        break;
      case 1:
      case 4:
        this.props.backward();
        break;
      default:
    }
  }

  handleTap() {
    this.props.forward();
  }

  render() {
    const {
      promptIndex,
      prompts,
    } = this.props;

    const promptsRender = prompts.map((prompt, index) =>
      (<Prompt
        key={index}
        label={prompt.text}
        isActive={promptIndex === index}
        isLeaving={promptIndex === (index - 1)}
      />),
    );

    const classes = cx(
      'prompts',
      { 'prompts--floating': this.props.floating },
    );

    if (prompts.length <= 1) {
      return (
        <div className={classes}>
          <div className="prompts__prompts">
            {promptsRender}
          </div>
        </div>
      );
    }

    return (
      <Touch onTap={this.handleTap} onSwipe={this.handleSwipe} >
        <div className={classes}>
          <div className="prompts__pips">
            <Pips count={prompts.length} currentIndex={promptIndex} />
          </div>

          <div className="prompts__prompts">
            {promptsRender}
          </div>
        </div>
      </Touch>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    promptIndex: findIndex(ownProps.prompts, ownProps.prompt),
  };
}

export { PromptSwiper };

export default connect(mapStateToProps)(PromptSwiper);

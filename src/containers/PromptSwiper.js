import React, { Component } from 'react';
import { connect } from 'react-redux';
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
    prompts: PropTypes.any.isRequired,
    promptIndex: PropTypes.number.isRequired,
    floating: PropTypes.bool,
    minimizable: PropTypes.bool,
  };

  static defaultProps = {
    floating: false,
    minimizable: false,
  };

  constructor(props) {
    super(props);

    this.state = {
      minimized: false,
    };
  }

  handleMinimize = () => {
    this.setState({
      minimized: !this.state.minimized,
    });
  };

  render() {
    const {
      minimizable,
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
      { 'prompts--floating': this.props.floating,
        'prompts--minimized': this.state.minimized },
    );

    const minimizeButton = (
      <span className="prompts__minimizer" onClick={this.handleMinimize}>
        {this.state.minimized ? '?' : '—'}
      </span>
    );

    if (prompts.length <= 1) {
      return (
        <React.Fragment>
          <div className={classes}>
            <div className="prompts__prompts">
              {promptsRender}
            </div>
          </div>
          {minimizable && minimizeButton}
        </React.Fragment>
      );
    }

    return (
      <React.Fragment>
        <div className={classes}>
          <div className="prompts__pips">
            <Pips count={prompts.length} currentIndex={promptIndex} />
          </div>
          {!this.state.minimized && (<div className="prompts__prompts">
            {promptsRender}
          </div>)}
        </div>
        {minimizable && minimizeButton}
      </React.Fragment>
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

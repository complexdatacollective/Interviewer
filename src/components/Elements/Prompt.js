import React, { Component } from 'react';

class Prompt extends Component {
  render() {

    const {
      label,
      isActive
    } = this.props;

    return (
      <div className={ isActive ? 'prompts__prompt prompts__prompt--active' : 'prompts__prompt' }>
        <h3>{ label }</h3>
      </div>
    );
  }
}

Prompt.propTypes = {
  label: React.PropTypes.string,
  isActive: React.PropTypes.bool,
};

Prompt.defaultProps = {
  label: '',
  isActive: false,
};

export default Prompt;

import React, { Component } from 'react';
import PropTypes from 'prop-types';

class Prompt extends Component {
  render() {

    const {
      label,
      isActive
    } = this.props;

    return (
      <div className={ isActive ? 'prompts__prompt prompts__prompt--active' : 'prompts__prompt' }>
        <h1>{ label }</h1>
      </div>
    );
  }
}

Prompt.propTypes = {
  label: PropTypes.string,
  isActive: PropTypes.bool,
};

Prompt.defaultProps = {
  label: '',
  isActive: false,
};

export default Prompt;

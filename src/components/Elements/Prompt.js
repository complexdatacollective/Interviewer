import React from 'react';
import PropTypes from 'prop-types';

const Prompt = (props) => {
  const {
    label,
    isActive,
  } = props;

  return (
    <div className={isActive ? 'prompts__prompt prompts__prompt--active' : 'prompts__prompt'}>
      <h1>{label}</h1>
    </div>
  );
};

Prompt.propTypes = {
  label: PropTypes.string,
  isActive: PropTypes.bool,
};

Prompt.defaultProps = {
  label: '',
  isActive: false,
};

export default Prompt;

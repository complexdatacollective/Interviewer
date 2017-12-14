import React from 'react';
import PropTypes from 'prop-types';

const AddCountButton = ({ className, count, onClick }) => (
  <button className={`add-count-button ${className}`} onClick={() => onClick()}>
    <span className="add-count-button__count">{count}</span>
  </button>
);

AddCountButton.defaultProps = {
  count: null,
  className: '',
  onClick: () => {},
};

AddCountButton.propTypes = {
  className: PropTypes.string,
  count: PropTypes.number,
  onClick: PropTypes.func,
};

export default AddCountButton;

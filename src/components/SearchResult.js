import React from 'react';
import PropTypes from 'prop-types';

// Placeholder result component

const SearchResult = ({ data, displayKey, onClick }) => (
  <div className="search__result" onClick={evt => onClick(data, evt)}>
    { data[displayKey] }
  </div>
);

SearchResult.propTypes = {
  data: PropTypes.object.isRequired,
  displayKey: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default SearchResult;

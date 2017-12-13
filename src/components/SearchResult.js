import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

// Placeholder result component

const SearchResult = ({ data, displayKey, isSelected, onClick }) => {
  const classNames = cx(
    'search__result',
    { 'search__result--selected': isSelected },
  );
  return (
    <div className={classNames} onClick={evt => onClick(data, evt)}>
      { data[displayKey] }
    </div>
  );
};

SearchResult.propTypes = {
  data: PropTypes.object.isRequired,
  displayKey: PropTypes.string.isRequired,
  isSelected: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
};

SearchResult.defaultProps = {
  isSelected: false,
};

export default SearchResult;

import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

// Placeholder result component

const SearchResult = ({ data, displayFields, isSelected, onClick }) => {
  const classNames = cx(
    'search__result',
    { 'search__result--selected': isSelected },
  );

  const headerLabel = field => (
    <h1 key="header">{ data[field] }</h1>
  );

  const subLabel = (field, i) => (
    <p key={`label_${i}`}>{ data[field] }</p>
  );

  const labelForField = (field, i) => {
    if (i === 0) {
      return headerLabel(field);
    }
    return subLabel(field, i);
  };

  const clickHandler = (evt) => {
    // Default on some devices is to hide software keyboard
    evt.preventDefault();
    onClick(data, evt);
  };

  return (
    <div className={classNames} onClick={clickHandler}>
      { displayFields.map(labelForField) }
    </div>
  );
};

SearchResult.propTypes = {
  data: PropTypes.object.isRequired,
  displayFields: PropTypes.arrayOf(PropTypes.string).isRequired,
  isSelected: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
};

SearchResult.defaultProps = {
  isSelected: false,
};

export default SearchResult;

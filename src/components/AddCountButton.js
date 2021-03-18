import React from 'react';
import PropTypes from 'prop-types';

const baseClass = 'add-count-button';

/**
 * @class  AddCountButton
 *
 * @description
 * Renders an "Add" button with a count [of the number of items to be added].
 *
 * Example use: selecting multiple search results from autocomplete interface.
 *
 * @param {string} props.colorName a color named defined by Network-Canvas-UI
 * @param {number} props.count the natural number to display
 */
const AddCountButton = ({
  colorName, className, count, onClick,
}) => (
  <button
    className={`${baseClass} ${baseClass}--${colorName} ${className}`}
    onClick={() => onClick()}
    type="button"
  >
    <div className={`${baseClass}__background`}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 240">
        <title>Add</title>
        <g>
          <circle className={`${baseClass}__base`} cx="112" cy="128" r="112" />
          <path className={`${baseClass}__base-flash`} d="M 224 128 A 0.2,0.2 0 1,1 0,128" transform="rotate(-45 112 128)" />
          <ellipse className={`${baseClass}__badge`} cx="224.5" cy="56" rx="55.5" ry="56" />
          <rect className={`${baseClass}__plus`} x="220.5" y="38" width="8" height="36" />
          <rect className={`${baseClass}__plus`} x="220.5" y="38" width="8" height="36" transform="translate(168.5 280.5) rotate(-90)" />
        </g>
      </svg>
    </div>

    <span className={`${baseClass}__count`}>{count}</span>
  </button>
);

AddCountButton.defaultProps = {
  count: null,
  className: '',
  colorName: '',
  onClick: () => {},
};

AddCountButton.propTypes = {
  className: PropTypes.string,
  count: PropTypes.number,
  colorName: PropTypes.string,
  onClick: PropTypes.func,
};

export default AddCountButton;

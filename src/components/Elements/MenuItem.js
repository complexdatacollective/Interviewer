import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

/**
  * Renders a menu item using router links. Image is optional.
  */
function MenuItem(props) {
  const { onClick, imageType, title, isActive } = props;

  const itemClasses = classNames({
    menu__menuitem: true,
    'menu__menuitem--active': isActive,
  });
  return (
    <a onClick={onClick} className={itemClasses} tabIndex={0} role="menuitem" >
      {imageType && <img src={`/images/${imageType}.svg`} alt="type" />}
      {title}
    </a>
  );
}

MenuItem.propTypes = {
  onClick: PropTypes.func.isRequired,
  imageType: PropTypes.string,
  title: PropTypes.string.isRequired,
  isActive: PropTypes.bool,
};

MenuItem.defaultProps = {
  imageType: '',
  isActive: false,
};

export default MenuItem;

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

/**
  * Renders a menu item using router links. Image is optional.
  */
function MenuItem(props) {
  const { onClick, interfaceType, title, isActive } = props;

  const itemClasses = classNames(
    'menu__menuitem',
    `menu__menuitem--${interfaceType}`,
    {
      'menu__menuitem--active': isActive,
    },
  );

  return (
    <a onClick={onClick} className={itemClasses} tabIndex={0} role="menuitem">
      {title}
    </a>
  );
}

MenuItem.propTypes = {
  onClick: PropTypes.func.isRequired,
  interfaceType: PropTypes.string,
  title: PropTypes.string.isRequired,
  isActive: PropTypes.bool,
};

MenuItem.defaultProps = {
  interfaceType: '',
  isActive: false,
};

export default MenuItem;

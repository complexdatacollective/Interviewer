import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Icon } from 'network-canvas-ui';

/**
  * Renders a menu item. Image is based on icon.
  */
function MenuItem(props) {
  const { onClick, interfaceType, icon, isActive, menuType, label } = props;

  const iconMap = {
    NameGenerator: 'menu-name-generator',
    NameGeneratorList: 'menu-name-generator',
    Sociogram: 'menu-sociogram',
  };

  const mappedIcon = icon || (interfaceType && iconMap[interfaceType]) || 'menu-default-interface';

  const itemClasses = classNames(
    'menu__menuitem',
    {
      'menu__menuitem--active': isActive,
    },
    `menu__menuitem--${menuType}`,
  );

  return (
    <a onClick={onClick} className={itemClasses} tabIndex={0} role="menuitem">
      <Icon name={mappedIcon} />
      {label}
    </a>
  );
}

MenuItem.propTypes = {
  onClick: PropTypes.func.isRequired,
  icon: PropTypes.string,
  interfaceType: PropTypes.string,
  isActive: PropTypes.bool,
  menuType: PropTypes.string,
  label: PropTypes.string.isRequired,
};

MenuItem.defaultProps = {
  isActive: false,
  icon: '',
  interfaceType: '',
  menuType: 'primary',
};

export default MenuItem;

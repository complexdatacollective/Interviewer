import React from 'react';
import { NavLink } from 'react-router-dom';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Icon } from '../ui/components';

/**
  * Renders a menu item. Image is based on icon.
  */
function MenuItem(props) {
  const { icon, interfaceType, isActive, label, menuType, onClick, to } = props;

  const iconMap = {
    NameGenerator: 'menu-name-generator',
    NameGeneratorAutoComplete: 'menu-name-generator',
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
    to ? (
      <NavLink
        onClick={onClick}
        className={itemClasses}
        activeClassName="menu__menuitem--active"
        to={to}
      >
        <Icon name={mappedIcon} />
        {label}
      </NavLink>) :
      (<a onClick={onClick} className={itemClasses} tabIndex={0} role="menuitem">
        <Icon name={mappedIcon} />
        {label}
      </a>)
  );
}

MenuItem.propTypes = {
  icon: PropTypes.string,
  interfaceType: PropTypes.string,
  isActive: PropTypes.bool,
  label: PropTypes.string.isRequired,
  menuType: PropTypes.string,
  onClick: PropTypes.func,
  to: PropTypes.string,
};

MenuItem.defaultProps = {
  icon: '',
  interfaceType: '',
  isActive: false,
  menuType: 'primary',
  onClick: () => {},
  to: '',
};

export default MenuItem;

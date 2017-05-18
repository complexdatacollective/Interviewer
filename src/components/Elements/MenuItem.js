import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

/**
  * Renders a menu item using router links. Image is optional.
  */
function MenuItem(props) {
  const itemClasses = classNames({
    menu__menuitem: true,
    'menu__menuitem--active': props.isActive,
  });
  return (
    <a onClick={props.onClick} className={itemClasses} tabIndex={0} >
      {props.imageType && <img src={`/images/${props.imageType}.svg`} alt="type" />}
      {props.title}
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

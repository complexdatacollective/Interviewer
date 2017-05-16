import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';

/**
  * Renders a menu item using router links. Image is optional.
  */
function MenuItem(props) {
  return (
    <Link to={props.to} onClick={props.onClick} activeClassName="bm-item-active">
      {props.imageType && <img src={'/images/{props.imageType}.svg'} alt="type" />}
      {props.title}
    </Link>
  );
}

MenuItem.propTypes = {
  to: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  imageType: PropTypes.string,
  title: PropTypes.string.isRequired,
};

MenuItem.defaultProps = {
  imageType: '',
};

export default MenuItem;

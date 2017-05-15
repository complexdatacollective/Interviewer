import React from 'react';
import { Link } from 'react-router';

/**
  * Renders a menu item using router links. Image is optional.
  */
function MenuItem(props) {
  return (
    <Link to={props.to} onClick={props.onClick} activeClassName='bm-item-active'>
      {props.imageType && <img src={"/images/"+props.imageType+".svg"} />}
      {props.title}
    </Link>
  );
}

export default MenuItem;

import React from 'react';
import { Link } from 'react-router';

function MenuItem(props) {
  return (
    <Link to={props.to} onClick={props.onClick} activeClassName='bm-item-active'>
      {props.title}
    </Link>
  );
}

export default MenuItem;

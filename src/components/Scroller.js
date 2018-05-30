import React from 'react';
import PropTypes from 'prop-types';

import { scrollable } from '../behaviours';

const Scroller = ({ className, ...props }) => (
  <div className={className}>
    {props.children}
  </div>
);

Scroller.defaultProps = {
  className: '',
};

Scroller.propTypes = {
  children: PropTypes.any.isRequired,
  className: PropTypes.string,
};

export default scrollable(Scroller);

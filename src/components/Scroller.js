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
  onScroll: () => {},
};

Scroller.propTypes = {
  children: PropTypes.any.isRequired,
  className: PropTypes.string,
  onScroll: PropTypes.function,
};

export default scrollable(Scroller);

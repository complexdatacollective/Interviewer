import React from 'react';
import PropTypes from 'prop-types';

import { scrollable } from '../behaviours';

const Scroller = props => (
  <div>
    {props.children}
  </div>
);

Scroller.propTypes = {
  children: PropTypes.any.isRequired,
};

export default scrollable(Scroller);

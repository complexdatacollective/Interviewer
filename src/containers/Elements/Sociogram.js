import React from 'react';
import PropTypes from 'prop-types';

const Sociogram = ({ children }) => (
  <div className="sociogram">
    { children }
  </div>
);

Sociogram.propTypes = {
  children: PropTypes.node,
};

Sociogram.defaultProps = {
  children: null,
};

export default Sociogram;

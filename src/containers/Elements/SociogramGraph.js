import React from 'react';
import PropTypes from 'prop-types';

const SociogramGraph = ({ children }) => (
  <div className="sociogram-graph">
    { children }
  </div>
);

SociogramGraph.propTypes = {
  children: PropTypes.node,
};

SociogramGraph.defaultProps = {
  children: null,
};

export default SociogramGraph;

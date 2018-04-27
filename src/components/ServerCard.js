import React from 'react';
import PropTypes from 'prop-types';
import logo from '../images/Srv-Flat.svg';

/**
  * Renders a container onto which a `draggable` can be dropped.
  */
const ServerCard = ({ children, data, onSelectServer }) => (
  <div className="server-card" onClick={evt => onSelectServer(evt, data)}>
    <img src={logo} className="server-card__icon" alt={children} />
    <h6 className="server-card__label">{children}</h6>
  </div>
);

ServerCard.propTypes = {
  data: PropTypes.object,
  children: PropTypes.any,
  onSelectServer: PropTypes.func,
};

ServerCard.defaultProps = {
  data: {},
  children: null,
  onSelectServer: () => {},
};

export default ServerCard;

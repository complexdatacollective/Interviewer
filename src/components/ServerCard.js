import React from 'react';
import PropTypes from 'prop-types';
import logo from '../images/Srv-Flat.svg';

/**
  * Renders a container onto which a `draggable` can be dropped.
  */
const ServerCard = ({ children, data }) => (
  // eslint-disable-next-line
  <div className="server-card" onClick={() => { console.log(data); }}>
    <img src={logo} className="server-card__icon" alt={children} />
    <h6 className="server-card__label">{children}</h6>
  </div>
);

ServerCard.propTypes = {
  data: PropTypes.object,
  children: PropTypes.any,
};

ServerCard.defaultProps = {
  data: {},
  children: null,
};

export default ServerCard;

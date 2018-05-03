import React from 'react';
import PropTypes from 'prop-types';
import logo from '../../images/Srv-Flat.svg';

const ServerCard = ({ children, data, selectServer, className, ...props }) => (
  <div className={`server-card ${className}`} onClick={() => selectServer(data)} {...props} >
    <img src={logo} className="server-card__icon" alt={children} />
    <h6 className="server-card__label">{children}</h6>
  </div>
);

ServerCard.propTypes = {
  data: PropTypes.object,
  children: PropTypes.any,
  className: PropTypes.string,
  selectServer: PropTypes.func,
};

ServerCard.defaultProps = {
  data: {},
  children: null,
  className: '',
  selectServer: () => {},
};

export default ServerCard;

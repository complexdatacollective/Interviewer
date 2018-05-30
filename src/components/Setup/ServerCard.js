import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import logo from '../../images/Srv-Flat.svg';

const noClick = () => {};

const ServerCard = ({ children, data, selectServer, isPaired, className, ...props }) => {
  const cssClass = classNames(
    'server-card',
    { 'server-card--paired': isPaired },
    { 'server-card--clickable': selectServer !== noClick },
    className,
  );
  return (
    <div className={cssClass} onClick={() => selectServer(data)} {...props} >
      <img src={logo} className="server-card__icon" alt={children} />
      <h6 className="server-card__label">{children}</h6>
    </div>
  );
};

ServerCard.propTypes = {
  data: PropTypes.object,
  children: PropTypes.any,
  className: PropTypes.string,
  isPaired: PropTypes.bool,
  selectServer: PropTypes.func,
};

ServerCard.defaultProps = {
  data: {},
  children: null,
  className: '',
  isPaired: false,
  selectServer: noClick,
};

export default ServerCard;

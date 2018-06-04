import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import logo from '../../images/Srv-Flat.svg';

const noClick = () => {};

/**
 * Renders a server icon & label. The label defaults to server name, falling back
 * to its first address (both provided via the `data` prop). If `secondaryLabel`
 * is provided, then it will be appended.
 */
const ServerCard = ({ data, secondaryLabel, selectServer, isPaired, className, ...props }) => {
  const cssClass = classNames(
    'server-card',
    { 'server-card--paired': isPaired },
    { 'server-card--clickable': selectServer !== noClick },
    className,
  );
  const { name, addresses = [] } = data;
  let label = name || addresses[0];
  if (secondaryLabel) {
    label += ` ${secondaryLabel}`;
  }
  return (
    <div className={cssClass} onClick={() => selectServer(data)} {...props} >
      <img src={logo} className="server-card__icon" alt="Available Server" />
      <h6 className="server-card__label">
        {label}
      </h6>
    </div>
  );
};

ServerCard.propTypes = {
  data: PropTypes.shape({
    name: PropTypes.string,
    addresses: PropTypes.array,
  }),
  className: PropTypes.string,
  isPaired: PropTypes.bool,
  selectServer: PropTypes.func,
  secondaryLabel: PropTypes.string,
};

ServerCard.defaultProps = {
  data: {},
  className: '',
  isPaired: false,
  selectServer: noClick,
  secondaryLabel: null,
};

export default ServerCard;

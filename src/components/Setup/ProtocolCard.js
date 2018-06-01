import React from 'react';
import PropTypes from 'prop-types';

import { Icon } from '../../ui/components';

const largeVariant = 'large';

const withBemModifier = (baseClass, size) => {
  let cssClass = baseClass;
  if (size === largeVariant) {
    cssClass += ` ${baseClass}--${largeVariant}`;
  }
  return cssClass;
};

const ProtocolCard = ({ protocol, selectProtocol, className, size }) => {
  const sized = baseClass => withBemModifier(baseClass, size);
  return (
    <div className={`${sized('protocol-card')} ${className}`} onClick={() => selectProtocol(protocol)}>
      <Icon className="protocol-card__icon" name="add-a-screen" />
      <div className="protocol-card__labels">
        <h3 className={sized('protocol-card__name')}>{protocol.name}</h3>
        <p className="protocol-card__version">{protocol.version}</p>
      </div>
    </div>
  );
};

ProtocolCard.defaultProps = {
  className: '',
  selectProtocol: () => {},
  size: '',
};

ProtocolCard.propTypes = {
  className: PropTypes.string,
  selectProtocol: PropTypes.func,
  protocol: PropTypes.shape({
    name: PropTypes.string.isRequired,
    version: PropTypes.string.isRequired,
  }).isRequired,
  size: PropTypes.oneOf([largeVariant]),
};

export default ProtocolCard;

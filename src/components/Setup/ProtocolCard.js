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
      <div className="protocol-card__icon-wrapper">
        <Icon className="protocol-card__icon" name="protocol-card" />
      </div>
      <div className="protocol-card__labels">
        <h2 className={sized('protocol-card__name')}>{protocol.name}</h2>
        { protocol.description ? (<p className="protocol-card__description">{protocol.description}</p>) : ''}
      </div>
    </div>
  );
};

ProtocolCard.defaultProps = {
  className: '',
  selectProtocol: () => {},
  size: '',
  description: null,
};

ProtocolCard.propTypes = {
  className: PropTypes.string,
  selectProtocol: PropTypes.func,
  protocol: PropTypes.shape({
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
  }).isRequired,
  size: PropTypes.oneOf([largeVariant, '']),
};

export default ProtocolCard;

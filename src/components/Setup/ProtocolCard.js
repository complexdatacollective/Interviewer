import React from 'react';
import PropTypes from 'prop-types';

import { Icon } from '../../ui/components';

const ProtocolCard = ({ protocol, selectProtocol, onDelete }) => (
  <div className="protocol-card" onClick={() => selectProtocol(protocol)}>
    <div className="protocol-card__delete" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(); }}>
      <Icon name="delete" />
    </div>
    <h2 className="protocol-card__name">{protocol.name}</h2>
    <div className="protocol-card__icon-wrapper">
      <Icon className="protocol-card__icon" name="protocol-card" />
    </div>
    { protocol.description ? (<p className="protocol-card__description">{protocol.description}</p>) : ''}
  </div>
);

ProtocolCard.defaultProps = {
  className: '',
  selectProtocol: () => {},
  description: null,
};

ProtocolCard.propTypes = {
  selectProtocol: PropTypes.func,
  onDelete: PropTypes.func.isRequired,
  protocol: PropTypes.shape({
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
  }).isRequired,
};

export default ProtocolCard;

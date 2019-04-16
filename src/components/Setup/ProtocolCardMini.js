import React from 'react';
import PropTypes from 'prop-types';

import { Icon } from '../../ui/components';

const ProtocolCardMini = ({ protocol, selectProtocol }) => (
  <div className="protocol-card-mini" onClick={() => selectProtocol(protocol)}>
    <div className="protocol-card-mini__icon-wrapper">
      <Icon className="protocol-card-mini__icon" name="protocol-card" />
    </div>
    <div className="protocol-card-mini__content">
      <h2 className="protocol-card-mini__name">{protocol.name}</h2>
      { protocol.description ? (<p className="protocol-card-mini__description">{protocol.description}</p>) : ''}
    </div>
  </div>
);

ProtocolCardMini.defaultProps = {
  className: '',
  selectProtocol: () => {},
  description: null,
};

ProtocolCardMini.propTypes = {
  selectProtocol: PropTypes.func,
  protocol: PropTypes.shape({
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
  }).isRequired,
};

export default ProtocolCardMini;

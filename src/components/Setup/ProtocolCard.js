import React from 'react';
import PropTypes from 'prop-types';

import { Icon } from '../../ui/components';

const ProtocolCard = ({ protocol, download }) => (
  <div className="protocol-card" onClick={() => download(protocol.downloadUrl)}>
    <Icon className="protocol-card__icon" name="menu-default-interface" />
    <div className="protocol-card__labels">
      <h3 className="protocol-card__name">{protocol.name}</h3>
      <p className="protocol-card__version">{protocol.version}</p>
    </div>
  </div>
);

ProtocolCard.defaultProps = {
  download: () => {},
};

ProtocolCard.propTypes = {
  download: PropTypes.func,
  protocol: PropTypes.shape({
    name: PropTypes.string.isRequired,
    version: PropTypes.string.isRequired,
  }).isRequired,
};

export default ProtocolCard;

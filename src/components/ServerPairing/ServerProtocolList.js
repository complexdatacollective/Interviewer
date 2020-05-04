import React from 'react';
import PropTypes from 'prop-types';

import { Scroller } from '..';
import ProtocolCard from '../ProtocolCard';

const EmptyProtocolList = (
  <div className="server-protocol-list server-protocol-list--empty">
    <h4>No protocols available</h4>
  </div>
);

const ServerProtocolList = ({ protocols, selectProtocol }) => {
  if (!protocols.length) {
    return EmptyProtocolList;
  }

  return (
    <div className="server-protocol-list">
      <Scroller className="server-protocol-list__scroller">
        {
          protocols.map(protocol => (
            <ProtocolCard
              key={protocol.id}
              selectProtocol={p => selectProtocol(p)}
              protocol={protocol}
            />
          ))
        }
      </Scroller>
    </div>
  );
};

ServerProtocolList.propTypes = {
  selectProtocol: PropTypes.func.isRequired,
  protocols: PropTypes.array.isRequired,
};

export default ServerProtocolList;

import React from 'react';
import PropTypes from 'prop-types';

import { Scroller } from '../../components';
import ProtocolCard from './ProtocolCard';

const EmptyProtocolList = (
  <div className="server-protocol-list server-protocol-list--empty">
    <h4>No protocols available</h4>
  </div>
);

const ServerProtocolList = ({ protocols, selectProtocol }) => {
  let leftBorderClass = 'server-protocol-list__left-border';
  if (!protocols.length) {
    return EmptyProtocolList;
  }

  if (protocols.length === 1) {
    leftBorderClass += ` ${leftBorderClass}--single-protocol`;
  }
  return (
    <div className="server-protocol-list">
      <div className="server-protocol-list__prefix" />
      <Scroller className="server-protocol-list__scroller">
        <div key="left-border" className={leftBorderClass} />
        {
          protocols.map(protocol => (
            <div className="server-protocol-list__bordered-card" key={protocol.id}>
              <div className="server-protocol-list__card-border" />
              <ProtocolCard
                className="server-protocol-list__card"
                selectProtocol={p => selectProtocol(p)}
                protocol={protocol}
              />
            </div>
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

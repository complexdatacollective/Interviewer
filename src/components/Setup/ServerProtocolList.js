import React from 'react';
import PropTypes from 'prop-types';

import { Scroller } from '../../components';
import ProtocolCard from './ProtocolCard';

const EmptyProtocolList = (
  <div className="protocol-card-list">
    <h4>No protocols available</h4>
  </div>
);

const ServerProtocolList = ({ protocols, download }) => {
  let leftBorderClass = 'protocol-card-list__left-border';
  if (!protocols.length) {
    return EmptyProtocolList;
  }

  if (protocols.length === 1) {
    leftBorderClass += ` ${leftBorderClass}--single-protocol`;
  }
  return (
    <div className="protocol-card-list">
      <div className="protocol-card-list__prefix" />
      <Scroller className="protocol-card-list__scroller">
        <div key="left-border" className={leftBorderClass} />
        {
          protocols.map(protocol => (
            <div className="protocol-card-list__bordered-card" key={protocol.downloadUrl}>
              <div className="protocol-card-list__card-border" />
              <ProtocolCard
                className="protocol-card-list__card"
                selectProtocol={p => download(p.downloadUrl)}
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
  download: PropTypes.func.isRequired,
  protocols: PropTypes.array.isRequired,
};

export default ServerProtocolList;

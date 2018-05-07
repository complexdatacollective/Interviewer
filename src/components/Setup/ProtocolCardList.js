import React from 'react';
import PropTypes from 'prop-types';

import { Scroller } from '../../components';
import ProtocolCard from './ProtocolCard';

const ProtocolCardList = ({ protocols, download }) => (
  <div className="protocol-card-list">
    <div className="protocol-card-list__prefix" />
    <Scroller className="protocol-card-list__scroller">
      <div key="left-border" className="protocol-card-list__left-border" />
      {
        protocols.map(protocol => (
          <div className="protocol-card-list__bordered-card" key={protocol.downloadUrl}>
            <div className="protocol-card-list__card-border" />
            <ProtocolCard
              className="protocol-card-list__card"
              download={download}
              protocol={protocol}
            />
          </div>
        ))
      }
    </Scroller>
  </div>
);

ProtocolCardList.propTypes = {
  download: PropTypes.func.isRequired,
  protocols: PropTypes.array.isRequired,
};

export default ProtocolCardList;

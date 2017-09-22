/* eslint-disable */

import React from 'react';
import PropTypes from 'prop-types';

const Bin = ({ title, index }) => {
  return (
    <div className="ordinal-bin__bin">
      <div className="ordinal-bin__bin-title">{title}</div>
      <div className="ordinal-bin__bin-content"></div>
    </div>
  )
}

const OrdinalBins = ({ stage, prompt }) => {
  
  const binTitles = prompt.bins.titles
  const bins = binTitles.map(
    (bin, i) => <Bin title={binTitles[i]} key={i} />
  );
  
  return (
    <div className="ordinal-bin">
      {bins}
    </div>
  );
}

OrdinalBins.propTypes = {
  stage: PropTypes.object.isRequired,
  prompt: PropTypes.object.isRequired,
};

export default OrdinalBins;

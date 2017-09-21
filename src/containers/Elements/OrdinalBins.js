/* eslint-disable */

import React from 'react';
import PropTypes from 'prop-types';

const Bin = ({ title, index }) => {
  <div className={'bin-'+index}></div>
}

const OrdinalBins = ({ stage, prompt }) => {
  
  const binTitles = prompt.bins.titles
  const bins = [];
  for (let index = 0; index < binTitles.count; index++) {
    bins.push(<Bin index={index} title={binTitles[index]} />);
  };

  return (
    <div className="ordinalbin">
      {bins}
    </div>
  );
}

OrdinalBins.propTypes = {
  stage: PropTypes.object.isRequired,
  prompt: PropTypes.object.isRequired,
};

export default OrdinalBins;

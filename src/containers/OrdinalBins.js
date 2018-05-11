import React from 'react';
import PropTypes from 'prop-types';
// import { map, orderBy } from 'lodash';

const OrdinalBins = ({ prompt }) => {
  const bins = prompt.bins.map(
    binValue => (
      <Bin
        title={binValue.label}
        value={binValue.value}
      />
    ),
  );

  console.log(bins);
  return (
    bins
  );
};

const Bin = ({ title }) => (
  <div className="ordinal-bin">
    <div className="ordinal-bin--title">{title}</div>
    <div className="ordinal-bin--content" />
  </div>
);

Bin.propTypes = {
  title: PropTypes.string.isRequired,
};

OrdinalBins.propTypes = {
  prompt: PropTypes.object.isRequired,
};

export default OrdinalBins;

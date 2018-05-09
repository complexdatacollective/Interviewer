import React from 'react';
import PropTypes from 'prop-types';
import { map, orderBy } from 'lodash';

const OrdinalBins = ({ prompt }) => {
  const binValues = orderBy(
    map(prompt.bins,
      (value, title) => [title, value],
    ),
    titleValuePair => titleValuePair[1],
    'desc',
  );

  const bins = binValues.map(
    binValue => (
      <Bin
        title={binValue[0]}
        value={binValue[1]}
      />
    ),
  );

  return (
    <div>
      { bins }
    </div>
  );
};

const Bin = ({ title }) => (
  <div className="ordinal-bin__bin">
    <div className="ordinal-bin__bin--title">{title}</div>
    <div className="ordinal-bin__bin--content" />
  </div>
);

Bin.propTypes = {
  title: PropTypes.string.isRequired,
};

OrdinalBins.propTypes = {
  prompt: PropTypes.object.isRequired,
};

export default OrdinalBins;

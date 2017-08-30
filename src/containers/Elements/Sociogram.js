/* eslint-disable */

import React from 'react';
import PropTypes from 'prop-types';
import {
  SociogramBackground,
  NodeLayout,
  EdgeLayout,
  NodeBucket,
} from '../Elements';

const Sociogram = ({ nodeAttributes, background, edge, layout, position, select, sort }) => (
  <div className="sociogram">
    <SociogramBackground {...background} />
    {
      edge &&
      <EdgeLayout
        type={edge.type}
        color={edge.color}
        layout={layout}
      />
    }
    <NodeLayout
      edge={edge}
      attributes={nodeAttributes}
      layout={layout}
      select={select}
      position={position}
    />
    <NodeBucket
      layout={layout}
      sort={sort}
    />
  </div>
);

Sociogram.propTypes = {
  background: PropTypes.object.isRequired,
  layout: PropTypes.string.isRequired,
  nodeAttributes: PropTypes.object,
  edge: PropTypes.object,
  position: PropTypes.bool,
  select: PropTypes.object,
  sort: PropTypes.object,
};

Sociogram.defaultProps = {
  nodeAttributes: null,
  edge: null,
  position: false,
  select: null,
  sort: null,
};

export default Sociogram;

import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'network-canvas-ui';
import {
  SociogramBackground,
  NodeLayout,
  EdgeLayout,
  NodeBucket,
} from '../Elements';
import { resetPropertyForAllNodes } from '../../utils/reset';

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
    <div style={{ position: 'absolute', right: 0, bottom: '20px' }}>
      <Button onClick={() => { resetPropertyForAllNodes(layout); }}>Reset Layout</Button>
    </div>
  </div>
);

Sociogram.propTypes = {
  background: PropTypes.object.isRequired,
  layout: PropTypes.string.isRequired,
  nodeAttributes: PropTypes.string,
  edge: PropTypes.object,
  position: PropTypes.bool,
  select: PropTypes.object,
  sort: PropTypes.object,
};

Sociogram.defaultProps = {
  nodeAttributes: null,
  edge: null,
  position: PropTypes.bool,
  select: null,
  sort: null,
};

export default Sociogram;

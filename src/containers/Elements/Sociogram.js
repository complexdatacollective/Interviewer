/* eslint-disable */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  SociogramBackground,
  NodeLayout,
  EdgeLayout,
  NodeBucket,
} from '../Elements';
import { actionCreators as networkActions } from '../../ducks/modules/network';

const Sociogram = ({ stage, prompt }) => {
  
  const onDropNode = (hits, coords, node) => {
    const hit = first(hits);
    const relativeCoords = {
      x: (coords.x - hit.x) / hit.width,
      y: (coords.y - hit.y) / hit.height,
    };

    this.props.updateNode({ ...node, [this.props.layout]: relativeCoords });
  };
  
  return (
    <div className="sociogram">
      <SociogramBackground {...prompt.sociogram.background} />
      {
        prompt.sociogram.edge &&
        <EdgeLayout
          stage={stage}
          prompt={prompt}
        />
      }
      <NodeLayout
        stage={stage}
        prompt={prompt}
      />
      <NodeBucket
        stage={stage}
        prompt={prompt}
        onDropNode={onDropNode}
      />
    </div>
  )
};

Sociogram.propTypes = {
  stage: PropTypes.object.isRequired,
  prompt: PropTypes.object.isRequired,
};

function mapDispatchToProps(dispatch) {
  return {
    updateNode: bindActionCreators(networkActions.updateNode, dispatch),
  };
}

export default connect(mapDispatchToProps)(Sociogram);

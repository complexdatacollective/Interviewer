import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { first } from 'lodash';
import {
  SociogramBackground,
  NodeLayout,
  EdgeLayout,
  NodeBucket,
} from '../Elements';
import { actionCreators as networkActions } from '../../ducks/modules/network';

const Sociogram = ({ stage, prompt, updateNode }) => {
  const onDropNode = (hits, coords, node, layout) => {
    const hit = first(hits);
    const relativeCoords = {
      x: (coords.x - hit.x) / hit.width,
      y: (coords.y - hit.y) / hit.height,
    };

    updateNode({ ...node, [layout]: relativeCoords });
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
  );
};

Sociogram.propTypes = {
  stage: PropTypes.object.isRequired,
  prompt: PropTypes.object.isRequired,
  updateNode: PropTypes.func.isRequired,
};

function mapDispatchToProps(dispatch) {
  return {
    updateNode: bindActionCreators(networkActions.updateNode, dispatch),
  };
}

export default connect(null, mapDispatchToProps)(Sociogram);

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  Sociogram,
  SociogramBackground,
  NodeLayout,
  EdgeLayout,
  NodeBucket,
  PromptSwiper,
} from '../Elements';
import {
  activePrompt,
} from '../../selectors/session';

/**
  * Sociogram Interface
  * @extends Component
  */
const SociogramInterface = ({ prompt, prompts }) => (
  <div className="sociogram-interface">
    <div className="sociogram-interface__prompts">
      <PromptSwiper prompts={prompts} />
    </div>
    <div className="sociogram-interface__sociogram">
      <Sociogram>
        <SociogramBackground {...prompt.sociogram.background} />
        {
          prompt.edge &&
          <EdgeLayout
            type={prompt.edge.type}
            color={prompt.edge.color}
            layout={prompt.sociogram.layout}
          />
        }
        <NodeLayout
          edge={prompt.edge}
          attributes={prompt.nodeAttributes}
          layout={prompt.sociogram.layout}
          select={prompt.sociogram.select}
          position={prompt.sociogram.position}
        />
        <NodeBucket
          layout={prompt.sociogram.layout}
          sort={prompt.sort}
        />
      </Sociogram>
    </div>
  </div>
);

SociogramInterface.propTypes = {
  config: PropTypes.object.isRequired,
  prompts: PropTypes.array.isRequired,
  prompt: PropTypes.object.isRequired,
};

function mapStateToProps(state, ownProps) {
  return {
    prompt: activePrompt(state),
    prompts: ownProps.config.params.prompts,
  };
}

export default connect(mapStateToProps)(SociogramInterface);

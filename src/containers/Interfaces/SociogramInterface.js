import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  PromptSwiper,
} from '../Elements';
import {
  Sociogram,
} from '../Elements/Sociogram';
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
      <PromptSwiper prompts={prompts} floating />
    </div>
    <div className="sociogram-interface__sociogram">
      <Sociogram {...prompt.sociogram} />
    </div>
  </div>
);

SociogramInterface.propTypes = {
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

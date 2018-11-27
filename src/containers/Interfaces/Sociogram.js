import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withHandlers, compose } from 'recompose';
import PropTypes from 'prop-types';

import withPrompt from '../../behaviours/withPrompt';
import {
  ConcentricCircles,
  PromptObstacle,
  ButtonObstacle,
} from '../../containers/Canvas';
import { actionCreators as resetActions } from '../../ducks/modules/reset';

/**
  * Sociogram Interface
  * @extends Component
  */
class Sociogram extends Component {
  constructor(props) {
    super(props);
    this.linkingRef = React.createRef();
  }

  render() {
    const {
      promptForward,
      promptBackward,
      prompt,
      stage,
      resetInterface,
    } = this.props;

    return (
      <div className="sociogram-interface">
        <PromptObstacle
          id="PROMPTS_OBSTACLE"
          className="sociogram-interface__prompts"
          forward={promptForward}
          backward={promptBackward}
          prompts={stage.prompts}
          prompt={prompt}
          floating
          minimizable
        />
        <div className="sociogram-interface__sociogram">
          <ConcentricCircles
            stage={stage}
            prompt={prompt}
            key={prompt.id}
            ref={this.linkingRef}
          />
        </div>
        <div style={{ position: 'absolute', right: '3rem', bottom: '3rem' }}>
          <ButtonObstacle
            id="RESET_BUTTON_OBSTACLE"
            label="RESET"
            size="small"
            onClick={() => { resetInterface(stage.prompts, this.linkingRef); }}
          />
        </div>
      </div>
    );
  }
}

Sociogram.propTypes = {
  stage: PropTypes.object.isRequired,
  prompt: PropTypes.object.isRequired,
  promptForward: PropTypes.func.isRequired,
  promptBackward: PropTypes.func.isRequired,
  resetInterface: PropTypes.func.isRequired,
};

const mapDispatchToProps = dispatch => ({
  resetEdgesOfType: bindActionCreators(resetActions.resetEdgesOfType, dispatch),
  resetPropertyForAllNodes: bindActionCreators(resetActions.resetPropertyForAllNodes, dispatch),
});

export default compose(
  connect(null, mapDispatchToProps),
  withHandlers({
    resetInterface: props => (prompts, linkingRef) => {
      linkingRef.current.resetLinking();
      prompts.forEach((prompt) => {
        props.resetPropertyForAllNodes(prompt.layout.layoutVariable);
        if (prompt.edges) {
          props.resetEdgesOfType(prompt.edges.creates);
        }
      });
    },
  }),
  withPrompt,
)(Sociogram);

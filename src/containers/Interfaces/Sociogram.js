import React, { PureComponent } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withHandlers, compose } from 'recompose';
import PropTypes from 'prop-types';

import { Button } from '../../ui/components';
import withPrompt from '../../behaviours/withPrompt';
import { withBounds } from '../../behaviours';
import { DropObstacle } from '../../behaviours/DragAndDrop';
import { PromptSwiper, ConcentricCircles } from '../../containers/';
import { actionCreators as resetActions } from '../../ducks/modules/reset';

class PromptSwipable extends PureComponent {
  render() {
    return (
      <div className="sociogram-interface__prompts" component="sociogram-interface__prompts">
        <PromptSwiper {...this.props} />
      </div>
    );
  }
}

PromptSwipable.propTypes = {
  prompt: PropTypes.object.isRequired,
};

const PromptObstacle = compose(
  withBounds,
  withHandlers({
    accepts: () => () => true,
  }),
  DropObstacle,
)(PromptSwipable);

/**
  * Sociogram Interface
  * @extends Component
  */
const Sociogram = ({
  promptForward,
  promptBackward,
  prompt,
  stage,
  resetInterface,
}) => (
  <div className="sociogram-interface">
    <PromptObstacle
      id="PROMPTS_OBSTACLE"
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
      />
    </div>
    <div style={{ position: 'absolute', right: '50px', bottom: '50px' }}>
      <Button
        size="small"
        onClick={() => { resetInterface(stage.prompts); }}
      >
        Reset
      </Button>
    </div>
  </div>
);

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
    resetInterface: props => (prompts) => {
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

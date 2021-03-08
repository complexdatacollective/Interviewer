import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
  withHandlers, compose, withState, withPropsOnChange,
} from 'recompose';
import PropTypes from 'prop-types';
import withPrompt from '../../behaviours/withPrompt';
import {
  PromptObstacle,
  ButtonObstacle,
} from '../Canvas';
import { ConcentricCircles } from '../../components/Canvas';
import { actionCreators as resetActions } from '../../ducks/modules/reset';

const withConnectFrom = withState('connectFrom', 'setConnectFrom', null);

const withConnectFromHandler = withHandlers({
  handleConnectFrom: ({ setConnectFrom }) => (id) => setConnectFrom(id),
  handleResetConnectFrom: ({ setConnectFrom }) => () => setConnectFrom(null),
});

const withResetInterfaceHandler = withHandlers({
  handleResetInterface: ({
    handleResetConnectFrom,
    resetPropertyForAllNodes,
    resetEdgesOfType,
    stage,
  }) => () => {
    handleResetConnectFrom();
    stage.prompts.forEach((prompt) => {
      resetPropertyForAllNodes(prompt.layout.layoutVariable);
      if (prompt.edges) {
        resetEdgesOfType(prompt.edges.creates);
      }
    });
  },
});

const withPromptIdAsKey = withPropsOnChange(
  ['promptId'],
  (props) => ({ key: props.promptId }),
);

/**
  * Sociogram Interface
  * @extends Component
  */
const Sociogram = ({
  promptForward,
  promptBackward,
  prompt,
  stage,
  handleResetInterface,
  connectFrom,
  handleConnectFrom,
}) => {
  const { subject } = stage;
  const layoutVariable = prompt.layout && prompt.layout.layoutVariable;
  const highlightAttribute = prompt.highlight && prompt.highlight.variable;
  const allowHighlighting = prompt.highlight && prompt.highlight.allowHighlighting;
  const createEdge = prompt.edges && prompt.edges.create;
  const allowPositioning = prompt.layout && prompt.layout.allowPositioning;
  const displayEdges = (prompt.edges && prompt.edges.display) || [];
  const backgroundImage = stage.background && stage.background.image;
  const concentricCircles = stage.background && stage.background.concentricCircles;
  const skewedTowardCenter = stage.background && stage.background.skewedTowardCenter;
  const { sortOrder } = prompt;

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
      <div className="sociogram-interface__concentric-circles">
        <ConcentricCircles
          subject={subject}
          layoutVariable={layoutVariable}
          highlightAttribute={highlightAttribute}
          allowHighlighting={allowHighlighting}
          createEdge={createEdge}
          allowPositioning={allowPositioning}
          displayEdges={displayEdges}
          backgroundImage={backgroundImage}
          concentricCircles={concentricCircles}
          skewedTowardCenter={skewedTowardCenter}
          sortOrder={sortOrder}
          connectFrom={connectFrom}
          updateLinkFrom={handleConnectFrom}
          key={prompt.id}
          stage={stage}
        />
      </div>
      <div style={{ position: 'absolute', right: '3rem', bottom: '3rem' }}>
        <ButtonObstacle
          id="RESET_BUTTON_OBSTACLE"
          label="RESET"
          size="small"
          onClick={handleResetInterface}
        />
      </div>
    </div>
  );
};

Sociogram.propTypes = {
  stage: PropTypes.object.isRequired,
  prompt: PropTypes.object.isRequired,
  promptForward: PropTypes.func.isRequired,
  promptBackward: PropTypes.func.isRequired,
  handleResetInterface: PropTypes.func.isRequired,
  connectFrom: PropTypes.string,
  handleConnectFrom: PropTypes.func.isRequired,
};

Sociogram.defaultProps = {
  connectFrom: null,
};

const mapDispatchToProps = (dispatch) => ({
  resetEdgesOfType: bindActionCreators(resetActions.resetEdgesOfType, dispatch),
  resetPropertyForAllNodes: bindActionCreators(resetActions.resetPropertyForAllNodes, dispatch),
});

export default compose(
  withPromptIdAsKey,
  connect(null, mapDispatchToProps),
  withConnectFrom,
  withConnectFromHandler,
  withResetInterfaceHandler,
  withPrompt,
)(Sociogram);

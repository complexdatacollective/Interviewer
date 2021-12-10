import React, { useRef } from 'react';
import { get } from 'lodash';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withHandlers, compose } from 'recompose';
import PropTypes from 'prop-types';
import withPrompt from '../../behaviours/withPrompt';
import { LayoutProvider } from '../../contexts/LayoutContext';
import Canvas from '../../components/RealtimeCanvas/Canvas';
import NodeBucket from '../Canvas/NodeBucket';
import NodeLayout from '../RealtimeCanvas/NodeLayout';
import EdgeLayout from '../../components/RealtimeCanvas/EdgeLayout';
import SimulationPanel from '../../components/RealtimeCanvas/SimulationPanel';
import Background from '../Canvas/Background';
import { actionCreators as resetActions } from '../../ducks/modules/reset';
import { getEdges, makeGetNextUnplacedNode, makeGetPlacedNodes } from '../../selectors/canvas';
import CollapsablePrompts from '../../components/CollapsablePrompts';

const withResetInterfaceHandler = withHandlers({
  handleResetInterface: ({
    resetPropertyForAllNodes,
    resetEdgesOfType,
    stage,
  }) => () => {
    stage.prompts.forEach((prompt) => {
      resetPropertyForAllNodes(prompt.layout.layoutVariable);
      if (prompt.edges) {
        resetEdgesOfType(prompt.edges.creates);
      }
    });
  },
});

/**
  * Sociogram Interface
  * @extends Component
  */
const Sociogram = (props) => {
  const {
    prompt,
    promptId,
    stage,
    handleResetInterface,
    nodes,
    nextUnplacedNode,
    edges,
  } = props;

  const interfaceRef = useRef(null);
  const dragSafeRef = useRef(null);

  // Behaviour Configuration
  const allowHighlighting = get(prompt, 'highlight.allowHighlighting', false);
  const createEdge = get(prompt, 'edges.create');
  const allowPositioning = get(prompt, 'prompt.layout.allowPositioning', true);
  // eslint-disable-next-line @codaco/spellcheck/spell-checker
  const allowAutomaticLayout = get(stage, 'behaviours.automaticLayout.enabled', false);

  // Display Properties
  const layoutVariable = get(prompt, 'layout.layoutVariable');
  const highlightAttribute = get(prompt, 'highlight.variable');

  // Background Configuration
  const backgroundImage = get(stage, 'background.image');
  const concentricCircles = get(stage, 'background.concentricCircles');
  const skewedTowardCenter = get(stage, 'background.skewedTowardCenter');

  return (
    <div className="sociogram-interface" ref={interfaceRef}>
      <div className="sociogram-interface__drag-safe" ref={dragSafeRef} />
      <CollapsablePrompts
        prompts={stage.prompts}
        currentPromptIndex={prompt.id}
        handleResetInterface={handleResetInterface}
        interfaceRef={dragSafeRef}
      />
      <div className="sociogram-interface__concentric-circles">
        <LayoutProvider
          layout={layoutVariable}
          nodes={nodes}
          edges={edges}
          allowAutomaticLayout={allowAutomaticLayout}
        >
          <Canvas className="concentric-circles" id="concentric-circles">
            <Background
              concentricCircles={concentricCircles}
              skewedTowardCenter={skewedTowardCenter}
              image={backgroundImage}
            />
            <EdgeLayout />
            <NodeLayout
              id="NODE_LAYOUT"
              highlightAttribute={highlightAttribute}
              layoutVariable={layoutVariable}
              allowHighlighting={allowHighlighting && !createEdge}
              allowPositioning={allowPositioning}
              createEdge={createEdge}
              key={promptId} // allows linking to reset without re-rendering the whole interface
            />
            <NodeBucket
              id="NODE_BUCKET"
              node={nextUnplacedNode}
              allowPositioning={allowPositioning}
            />
            <SimulationPanel
              dragConstraints={dragSafeRef}
            />
          </Canvas>
        </LayoutProvider>
      </div>
    </div>
  );
};

Sociogram.propTypes = {
  stage: PropTypes.object.isRequired,
  prompt: PropTypes.object.isRequired,
  promptId: PropTypes.number.isRequired,
  handleResetInterface: PropTypes.func.isRequired,
  nodes: PropTypes.array.isRequired,
  edges: PropTypes.array.isRequired,
};

Sociogram.defaultProps = {
};

const mapDispatchToProps = (dispatch) => ({
  resetEdgesOfType: bindActionCreators(resetActions.resetEdgesOfType, dispatch),
  resetPropertyForAllNodes: bindActionCreators(resetActions.resetPropertyForAllNodes, dispatch),
});

const makeMapStateToProps = () => {
  // const getDisplayEdges = makeGetDisplayEdges();
  const getPlacedNodes = makeGetPlacedNodes();
  const getNextUnplacedNode = makeGetNextUnplacedNode();

  const mapStateToProps = (state, ownProps) => ({
    edges: getEdges(state, ownProps),
    nodes: getPlacedNodes(state, ownProps),
    nextUnplacedNode: getNextUnplacedNode(state, ownProps),
  });

  return mapStateToProps;
};

export default compose(
  withPrompt,
  connect(makeMapStateToProps, mapDispatchToProps),
  withResetInterfaceHandler,
)(Sociogram);

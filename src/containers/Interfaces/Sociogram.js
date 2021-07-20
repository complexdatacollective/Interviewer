import React, {
  useEffect,
  useState,
  useRef,
} from 'react';
import { get, omit } from 'lodash';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withHandlers, compose, withPropsOnChange } from 'recompose';
import PropTypes from 'prop-types';
import withPrompt from '../../behaviours/withPrompt';
import Canvas from '../../components/Canvas/Canvas';
import NodeBucket from '../Canvas/NodeBucket';
import NodeLayout from '../Canvas/NodeLayout';
import EdgeLayout from '../../components/Canvas/EdgeLayout';
import Background from '../Canvas/Background';
import PromptObstacle from '../Canvas/PromptObstacle';
import ButtonObstacle from '../Canvas/ButtonObstacle';
import { entityPrimaryKeyProperty, entityAttributesProperty } from '../../ducks/modules/network';
import { actionCreators as sessionActions } from '../../ducks/modules/sessions';
import { actionCreators as resetActions } from '../../ducks/modules/reset';
import { makeGetDisplayEdges, makeGetNextUnplacedNode, makeGetPlacedNodes } from '../../selectors/canvas';
import useAutoLayout from './useAutoLayout';

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

const withPromptIdAsKey = withPropsOnChange(
  ['promptId'],
  (props) => ({ key: props.promptId }),
);

const useAnimatedState = (initialState, getValue) => {
  const [state, setState] = useState(initialState);
  const raf = useRef();

  const loop = () => {
    setState(getValue());
    raf.current = window.requestAnimationFrame(loop);
  };

  useEffect(() => {
    loop();
    return () => window.cancelAnimationFrame(raf.current);
  }, []);

  return state;
};

/**
  * Sociogram Interface
  * @extends Component
  */
const Sociogram = (props) => {
  const {
    promptForward,
    promptBackward,
    prompt,
    stage,
    handleResetInterface,
    nodes,
    nextUnplacedNode,
    edges,
    updateNodes,
  } = props;

  const [enableAutoLayout, setEnableAutoLayout] = useState(false);
  const toggleEnableAutoLayout = () => setEnableAutoLayout((v) => !v);

  // Behaviour Configuration
  const allowHighlighting = get(prompt, 'highlight.allowHighlighting', false);
  const createEdge = get(prompt, 'edges.create');
  const allowPositioning = get(prompt, 'prompt.layout.allowPositioning', true);

  // Display Properties
  const layoutVariable = get(prompt, 'layout.layoutVariable');
  const highlightAttribute = get(prompt, 'highlight.variable');

  // Background Configuration
  const backgroundImage = get(stage, 'background.image');
  const concentricCircles = get(stage, 'background.concentricCircles');
  const skewedTowardCenter = get(stage, 'background.skewedTowardCenter');

  // Automatic Layout
  const [
    positionedNodes,
    positionedEdges,
    scale,
    isLayoutRunning,
    startLayout,
    stopLayout,
    updateLayout,
  ] = useAutoLayout(
    { layout: layoutVariable },
  );

  const displayNodes = useAnimatedState([], () => positionedNodes.current);
  const displayEdges = useAnimatedState([], () => positionedEdges.current);

  useEffect(() => {
    if (enableAutoLayout) {
      startLayout({
        nodes,
        edges,
      });
    } else {
      stopLayout();
    }

    return () => stopLayout();
  }, [enableAutoLayout]);

  useEffect(() => {
    updateLayout({
      nodes,
      edges,
    });
  }, [nodes, edges]);

  useEffect(() => {
    const newNodes = displayNodes.map((node) => {
      const nodeId = node[entityPrimaryKeyProperty];
      const attributeData = node[entityAttributesProperty];
      const modelData = omit(node, [entityPrimaryKeyProperty, entityAttributesProperty]);
      return [nodeId, modelData, attributeData];
    });

    // console.log(newNodes);

    updateNodes(newNodes);
  }, [displayNodes]);

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
        <Canvas className="concentric-circles" id="concentric-circles">
          <Background
            concentricCircles={concentricCircles}
            skewedTowardCenter={skewedTowardCenter}
            image={backgroundImage}
          />
          <EdgeLayout
            edges={displayEdges}
          />
          <NodeLayout
            nodes={displayNodes}
            id="NODE_LAYOUT"
            highlightAttribute={highlightAttribute}
            layoutVariable={layoutVariable}
            allowHighlighting={allowHighlighting && !createEdge}
            allowPositioning={allowPositioning}
            createEdge={createEdge}
          />
          <NodeBucket
            id="NODE_BUCKET"
            node={nextUnplacedNode}
            allowPositioning={allowPositioning}
          />
        </Canvas>
      </div>
      <div style={{ position: 'absolute', right: '3rem', bottom: '3rem' }}>
        <ButtonObstacle
          id="RESET_BUTTON_OBSTACLE"
          label="RESET"
          size="small"
          onClick={handleResetInterface}
        />
        <ButtonObstacle
          id="ENABLE_AUTO_LAYOUT"
          label="Enable auto layout"
          size="small"
          onClick={toggleEnableAutoLayout}
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
  nodes: PropTypes.array.isRequired,
  edges: PropTypes.array.isRequired,
};

Sociogram.defaultProps = {
};

const mapDispatchToProps = {
  resetEdgesOfType: resetActions.resetEdgesOfType,
  resetPropertyForAllNodes: resetActions.resetPropertyForAllNodes,
  updateNodes: sessionActions.updateNodes,
};

const makeMapStateToProps = () => {
  const getDisplayEdges = makeGetDisplayEdges();
  const getPlacedNodes = makeGetPlacedNodes();
  const getNextUnplacedNode = makeGetNextUnplacedNode();

  const mapStateToProps = (state, ownProps) => ({
    edges: getDisplayEdges(state, ownProps),
    nodes: getPlacedNodes(state, ownProps),
    nextUnplacedNode: getNextUnplacedNode(state, ownProps),
  });

  return mapStateToProps;
};

export default compose(
  withPrompt,
  withPromptIdAsKey,
  connect(makeMapStateToProps, mapDispatchToProps),
  withResetInterfaceHandler,
)(Sociogram);

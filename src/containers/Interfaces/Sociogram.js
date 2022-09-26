import React, { useCallback, useMemo, useRef } from 'react';
import { get, isArray } from 'lodash';
import { useDispatch, useSelector } from 'react-redux';
import { compose } from 'recompose';
import PropTypes from 'prop-types';
import withPrompt from '../../behaviours/withPrompt';
import { LayoutProvider } from '../../contexts/LayoutContext';
import Canvas from '../../components/RealtimeCanvas/Canvas';
import NodeLayout from '../../components/RealtimeCanvas/NodeLayout';
import EdgeLayout from '../../components/RealtimeCanvas/EdgeLayout';
import SimulationPanel from '../../components/RealtimeCanvas/SimulationPanel';
import Background from '../../components/RealtimeCanvas/Background';
import { actionCreators as resetActions } from '../../ducks/modules/reset';
import { getEdges, getNodes } from '../../selectors/canvas';
import CollapsablePrompts from '../../components/CollapsablePrompts';

/**
  * Sociogram Interface
  * @extends Component
  */
const Sociogram = React.memo((props) => {
  const {
    prompt,
    promptId,
    stage,
  } = props;

  const dispatch = useDispatch();

  const resetEdgesOfType = (type) => dispatch(resetActions.resetEdgesOfType(type));
  const resetPropertyForAllNodes = (property) => dispatch(
    resetActions.resetPropertyForAllNodes(property),
  );

  const handleResetInterface = useCallback(() => {
    stage.prompts.forEach((stagePrompt) => {
      resetPropertyForAllNodes(stagePrompt.layout.layoutVariable);
      if (stagePrompt.edges) {
        resetEdgesOfType(stagePrompt.edges.creates);
      }
    });
  }, [resetPropertyForAllNodes, resetEdgesOfType, stage]);

  const interfaceRef = useRef(null);
  const dragSafeRef = useRef(null);
  const twoMode = useMemo(() => isArray(stage.subject), [stage.subject]);

  // Behaviour Configuration
  const allowHighlighting = get(prompt, 'highlight.allowHighlighting', false);
  const createEdge = get(prompt, 'edges.create');
  const allowPositioning = get(prompt, 'prompt.layout.allowPositioning', true);
  // eslint-disable-next-line @codaco/spellcheck/spell-checker
  const enableAutomaticLayout = get(stage, 'behaviours.automaticLayout.enabled', false);
  const destinationRestriction = get(prompt, 'edges.restrict.destination', null);
  const originRestriction = get(prompt, 'edges.restrict.origin', null);

  // Display Properties
  const layoutVariable = get(prompt, 'layout.layoutVariable');
  const highlightAttribute = get(prompt, 'highlight.variable');

  // Background Configuration
  const backgroundImage = get(stage, 'background.image');
  const concentricCircles = get(stage, 'background.concentricCircles');
  const skewedTowardCenter = get(stage, 'background.skewedTowardCenter');

  const nodes = useSelector((state) => getNodes(state, props));
  const edges = useSelector((state) => getEdges(state, props));

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
          layoutAttributes={layoutVariable}
          twoMode={twoMode}
          nodes={nodes}
          edges={edges}
          enableAutomaticLayout={enableAutomaticLayout}
          allowPositioning={allowPositioning}
          allowSelect={allowHighlighting && !createEdge}
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
              destinationRestriction={destinationRestriction}
              originRestriction={originRestriction}
              createEdge={createEdge}
              key={promptId}
            />
            <SimulationPanel
              dragConstraints={dragSafeRef}
            />
          </Canvas>
        </LayoutProvider>
      </div>
    </div>
  );
});

Sociogram.propTypes = {
  stage: PropTypes.object.isRequired,
  prompt: PropTypes.object.isRequired,
  promptId: PropTypes.number.isRequired,
};

Sociogram.defaultProps = {
};

export default compose(
  withPrompt,
)(Sociogram);

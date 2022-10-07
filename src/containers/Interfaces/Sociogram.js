import React, { useCallback, useMemo, useRef } from 'react';
import { get, isArray } from 'lodash';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { LayoutProvider } from '../../contexts/LayoutContext';
import NodeLayout from '../../components/RealtimeCanvas/NodeLayout';
import EdgeLayout from '../../components/RealtimeCanvas/EdgeLayout';
import SimulationPanel from '../../components/RealtimeCanvas/SimulationPanel';
import Background from '../../components/RealtimeCanvas/Background';
import { actionCreators as resetActions } from '../../ducks/modules/reset';
import { getEdges, getNodes } from '../../selectors/canvas';
import CollapsablePrompts from '../../components/CollapsablePrompts';
import usePrompts from '../../hooks/usePrompts';

const Sociogram = React.memo((props) => {
  const {
    stage,
  } = props;

  const {
    prompt,
  } = usePrompts({ stage });

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
    <div className="sociogram-interface">
      <div className="sociogram-interface__drag-safe" ref={interfaceRef} />
      <CollapsablePrompts
        prompts={stage.prompts}
        currentPromptIndex={prompt.id}
        handleResetInterface={handleResetInterface}
        interfaceRef={interfaceRef}
      />
      <LayoutProvider
        nodes={nodes}
        edges={edges}
        twoMode={twoMode}
        layoutAttributes={layoutVariable}
        enableAutomaticLayout={enableAutomaticLayout}
        interfaceRef={interfaceRef}
      >
        <Background
          concentricCircles={concentricCircles}
          skewedTowardCenter={skewedTowardCenter}
          image={backgroundImage}
        />
        <EdgeLayout />
        <NodeLayout
          allowPositioning={allowPositioning}
          allowSelecting={allowHighlighting && !createEdge}
          allowEdgeCreation={createEdge && !allowHighlighting}
          highlightAttribute={highlightAttribute}
          createEdge={createEdge}
          destinationRestriction={destinationRestriction}
          originRestriction={originRestriction}
        />
        <SimulationPanel />
      </LayoutProvider>
    </div>
  );
});

Sociogram.propTypes = {
  stage: PropTypes.object.isRequired,
};

Sociogram.defaultProps = {
};

export default Sociogram;

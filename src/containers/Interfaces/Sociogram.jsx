import { isArray } from 'lodash';
import PropTypes from 'prop-types';
import React, { useMemo, useRef } from 'react';
import { connect, useSelector } from 'react-redux';
import { compose, withHandlers } from 'recompose';
import { bindActionCreators } from 'redux';

import withPrompt from '../../behaviours/withPrompt';
import CollapsablePrompts from '../../components/CollapsablePrompts';
import Canvas from '../../components/RealtimeCanvas/Canvas';
import EdgeLayout from '../../components/RealtimeCanvas/EdgeLayout';
import SimulationPanel from '../../components/RealtimeCanvas/SimulationPanel';
import { LayoutProvider } from '../../contexts/LayoutContext';
import { actionCreators as resetActions } from '../../ducks/modules/reset';
import {
  getEdges,
  getNextUnplacedNode,
  getNodes,
  getPlacedNodes,
} from '../../selectors/canvas';
import { get } from '../../utils/lodash-replacements';
import Background from '../Canvas/Background';
import NodeBucket from '../Canvas/NodeBucket';
import NodeLayout from '../RealtimeCanvas/NodeLayout';

const withResetInterfaceHandler = withHandlers({
  handleResetInterface:
    ({ resetPropertyForAllNodes, resetEdgesOfType, stage }) =>
    () => {
      stage.prompts.forEach((prompt) => {
        if (prompt.edges) {
          resetEdgesOfType(prompt.edges.creates);
        }

        const layoutVariable = get(prompt, 'layout.layoutVariable', null);
        if (!layoutVariable) {
          return;
        }

        if (typeof layoutVariable === 'string') {
          resetPropertyForAllNodes(layoutVariable);
        } else {
          Object.keys(layoutVariable).forEach((type) => {
            resetPropertyForAllNodes(layoutVariable[type]);
          });
        }
      });
    },
});

/**
 * Sociogram Interface
 * @extends Component
 */
const Sociogram = React.memo((props) => {
  const { prompt, promptId, stage, handleResetInterface } = props;

  const interfaceRef = useRef(null);
  const dragSafeRef = useRef(null);
  const twoMode = useMemo(() => isArray(stage.subject), [stage.subject]);

  // Behaviour Configuration
  const allowHighlighting = get(prompt, 'highlight.allowHighlighting', false);
  const createEdge = get(prompt, 'edges.create');
  const allowPositioning = get(prompt, 'prompt.layout.allowPositioning', true);
  const allowAutomaticLayout = get(
    stage,
    'behaviours.automaticLayout.enabled',
    false,
  );
  const destinationRestriction = get(
    prompt,
    'edges.restrict.destination',
    null,
  );
  const originRestriction = get(prompt, 'edges.restrict.origin', null);

  // Display Properties
  const layoutVariable = get(prompt, 'layout.layoutVariable');
  const highlightAttribute = get(prompt, 'highlight.variable');

  // Background Configuration
  const backgroundImage = get(stage, 'background.image');
  const concentricCircles = get(stage, 'background.concentricCircles');
  const skewedTowardCenter = get(stage, 'background.skewedTowardCenter');

  const allNodes = useSelector((state) => getNodes(state, props));
  const placedNodes = useSelector((state) => getPlacedNodes(state, props));
  const nextUnplacedNode = useSelector((state) =>
    getNextUnplacedNode(state, props),
  );

  const nodes = allowAutomaticLayout ? allNodes : placedNodes;
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
          layout={layoutVariable}
          twoMode={twoMode}
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
              layout={layoutVariable}
              twoMode={twoMode}
              destinationRestriction={destinationRestriction}
              originRestriction={originRestriction}
              allowHighlighting={allowHighlighting && !createEdge}
              allowPositioning={allowPositioning}
              createEdge={createEdge}
              key={promptId}
            />
            <NodeBucket
              id="NODE_BUCKET"
              allowPositioning={allowPositioning}
              node={nextUnplacedNode}
            />
            <SimulationPanel dragConstraints={dragSafeRef} />
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
  handleResetInterface: PropTypes.func.isRequired,
};

Sociogram.defaultProps = {};

const mapDispatchToProps = (dispatch) => ({
  resetEdgesOfType: bindActionCreators(resetActions.resetEdgesOfType, dispatch),
  resetPropertyForAllNodes: bindActionCreators(
    resetActions.resetPropertyForAllNodes,
    dispatch,
  ),
});

export default compose(
  withPrompt,
  connect(null, mapDispatchToProps),
  withResetInterfaceHandler,
)(Sociogram);

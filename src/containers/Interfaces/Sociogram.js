import React, { useEffect, useState, useRef } from 'react';
import { get } from 'lodash';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withHandlers, compose } from 'recompose';
import { AnimatePresence, motion } from 'framer-motion';
import PropTypes from 'prop-types';
import MinimizeIcon from '@material-ui/icons/Minimize';
import Prompts from '../../components/Prompts';
import withPrompt from '../../behaviours/withPrompt';
import Canvas from '../../components/Canvas/Canvas';
import NodeBucket from '../Canvas/NodeBucket';
import NodeLayout from '../Canvas/NodeLayout';
import EdgeLayout from '../../components/Canvas/EdgeLayout';
import Background from '../Canvas/Background';
import { actionCreators as resetActions } from '../../ducks/modules/reset';
import { makeGetDisplayEdges, makeGetNextUnplacedNode, makeGetPlacedNodes } from '../../selectors/canvas';

const CollapsablePrompts = (props) => {
  const {
    prompts,
    currentPromptIndex,
    interfaceRef,
  } = props;
  const ref = useRef(null);
  const [minimized, setMinimized] = useState(false);

  const variants = {
    minimized: {
      height: 0,
      transition: {
        duration: 0.5,
      },
    },
    normal: {
      height: 'auto',
      transition: {
        duration: 0.5,
        when: 'afterChildren',
      },
    },
  };

  // Reset the minimization when the prompt changes
  useEffect(() => {
    if (minimized) {
      // There was an animation 'jank' without this additional
      // timeout. I don't like it, but 'delay' in the variants
      // didn't work :/
      setTimeout(() => setMinimized(false), 250);
    }
  }, [currentPromptIndex]);

  return (
    <motion.div
      ref={ref}
      className="sociogram-interface__prompts"
      drag
      dragConstraints={interfaceRef}
    >
      <motion.div
        className="sociogram-interface__prompts__header"
        onTap={() => setMinimized(!minimized)}
      >
        { minimized ? (
          <motion.div
            style={{ width: '100%' }}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto', transition: { opacity: { delay: 0.5 } } }}
          >
            <h4>Tap to show the prompt</h4>
          </motion.div>
        ) : (
          <MinimizeIcon style={{ cursor: 'hand' }} />
        )}
      </motion.div>
      <motion.div
        animate={minimized ? 'minimized' : 'normal'}
        variants={variants}
      >
        <AnimatePresence initial={false}>
          { !minimized && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Prompts prompts={prompts} currentPrompt={currentPromptIndex} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

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

  return (
    <div className="sociogram-interface" ref={interfaceRef}>
      <CollapsablePrompts
        prompts={stage.prompts}
        currentPromptIndex={prompt.id}
        handleResetInterface={handleResetInterface}
        interfaceRef={interfaceRef}
      />
      <div className="sociogram-interface__concentric-circles">
        <Canvas className="concentric-circles" id="concentric-circles">
          <Background
            concentricCircles={concentricCircles}
            skewedTowardCenter={skewedTowardCenter}
            image={backgroundImage}
          />
          <EdgeLayout
            edges={edges}
          />
          <NodeLayout
            nodes={nodes}
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
        </Canvas>
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
  connect(makeMapStateToProps, mapDispatchToProps),
  withResetInterfaceHandler,
)(Sociogram);

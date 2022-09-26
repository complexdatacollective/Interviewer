import React, { useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { get, noop } from 'lodash';
import PropTypes from 'prop-types';
import Background from '../../components/RealtimeCanvas/Background';
import PresetSwitcher from '../../components/RealtimeCanvas/PresetSwitcher';
import Annotations from '../../components/RealtimeCanvas/Annotations';
import Canvas from '../../components/RealtimeCanvas/Canvas';
import ConvexHulls from '../../components/RealtimeCanvas/ConvexHulls';
import NodeLayout from '../../components/RealtimeCanvas/NodeLayout';
import EdgeLayout from '../../components/RealtimeCanvas/EdgeLayout';
import { LayoutProvider } from '../../contexts/LayoutContext';
import { getNodes, getPresetEdges } from '../../selectors/canvas';
import SimulationPanel from '../../components/RealtimeCanvas/SimulationPanel';

/**
  * Narrative Interface
  * @extends Component
  */
const Narrative = (props) => {
  const {
    stage,
  } = props;

  const {
    presets,
    background: {
      image: backgroundImage,
      concentricCircles,
      skewedTowardCenter,
    },
  } = stage;

  const [presetIndex, setPresetIndex] = useState(0);
  const [highlightIndex, setHighlightIndex] = useState(0);
  const [showConvexHulls, setShowConvexHulls] = useState(true);
  const [showEdges, setShowEdges] = useState(true);
  const [showHighlightedNodes, setShowHighlightedNodes] = useState(true);
  const [activeAnnotations, setActiveAnnotations] = useState(false);
  const [activeFocusNodes, setActiveFocusNodes] = useState(false);

  const [isFrozen, setIsFrozen] = useState(false);
  const [useAutomaticLayout, setUseAutomaticLayout] = useState(true);

  const annotationLayer = useRef(null);
  const dragSafeRef = useRef(null);

  const currentPreset = useMemo(() => presets[presetIndex], [presetIndex, presets]);

  const nodes = useSelector(getNodes);
  const edges = useSelector((state) => getPresetEdges(currentPreset)(state));

  const handleChangeActiveAnnotations = (status) => setActiveAnnotations(status);
  const handleToggleHulls = () => setShowConvexHulls(!showConvexHulls);
  const handleToggleEdges = () => setShowEdges(!showEdges);
  const handleToggleHighlighting = () => setShowHighlightedNodes(!showHighlightedNodes);
  const handleChangeHighlightIndex = (index) => setHighlightIndex(index);
  const handleToggleFreeze = () => setIsFrozen(!isFrozen);

  const handleResetInteractions = () => {
    if (annotationLayer.current) {
      annotationLayer.current.reset();
    }
  };

  const handleChangePreset = (index) => {
    if (index !== presetIndex) {
      setPresetIndex(index);
      setShowConvexHulls(true);
      setShowEdges(true);
      setShowHighlightedNodes(true);
      setHighlightIndex(0);
      setActiveAnnotations([]);
      setActiveFocusNodes([]);
    }
  };

  // Behaviour Configuration
  // eslint-disable-next-line @codaco/spellcheck/spell-checker
  const allowRepositioning = get(stage, 'behaviours.allowRepositioning', false);
  // eslint-disable-next-line @codaco/spellcheck/spell-checker
  const freeDraw = get(stage, 'behaviours.freeDraw', false);

  const shouldShowResetButton = useMemo(() => !!(activeAnnotations || activeFocusNodes),
    [activeAnnotations, activeFocusNodes]);

  // Display Properties
  const layoutVariable = useMemo(() => get(currentPreset, 'layoutVariable'), [currentPreset]);

  const displayEdges = useMemo(() => {
    if (!showEdges) { return []; }
    const presetDisplayEdges = get(currentPreset, 'edges.display', []);

    // EdgeLayout should only be passed edges that are included in the presets
    // edges.display list
    return edges.filter((edge) => presetDisplayEdges.includes(edge.type));
  }, [currentPreset, showEdges, edges]);

  const highlight = useMemo(() => get(currentPreset, 'highlight', []), [currentPreset]);

  const convexHullVariable = useMemo(() => {
    if (!showConvexHulls) { return null; }
    return get(currentPreset, 'groupVariable', null);
  }, [currentPreset, showConvexHulls]);

  console.log('convexHullVariable', convexHullVariable, currentPreset, showConvexHulls);

  return (
    <div className="narrative-interface" ref={dragSafeRef}>
      <div className="narrative-interface__canvas" id="narrative-interface__canvas">
        <LayoutProvider
          layout={layoutVariable}
          nodes={nodes}
          edges={displayEdges}
          allowAutomaticLayout={useAutomaticLayout}
          dontUpdateLayout
        >
          <Canvas
            className="narrative-concentric-circles"
            id="concentric-circles"
            key={`circles-${currentPreset.id}`}
          >
            <Background
              concentricCircles={concentricCircles}
              skewedTowardCenter={skewedTowardCenter}
              image={backgroundImage}
            />
            <ConvexHulls
              nodes={nodes}
              groupVariable={convexHullVariable}
              layoutVariable={layoutVariable}
            />
            <EdgeLayout />
            {
              freeDraw && (
                <Annotations
                  ref={annotationLayer}
                  isFrozen={isFrozen}
                  // onChangeActiveAnnotations={this.handleChangeActiveAnnotations}
                  onChangeActiveAnnotations={noop}
                />
              )
            }
            <NodeLayout
              id="NODE_LAYOUT"
              highlightAttribute={
                (showHighlightedNodes ? highlight[highlightIndex] : null)
              }
              layout={layoutVariable}
              allowPositioning={allowRepositioning}
              key={presetIndex}
            />
            <SimulationPanel dragConstraints={dragSafeRef} />
          </Canvas>
        </LayoutProvider>
        <PresetSwitcher
          id="drop-obstacle"
          presets={presets}
          activePreset={presetIndex}
          highlightIndex={highlightIndex}
          isFrozen={isFrozen}
          shouldShowResetButton={shouldShowResetButton}
          shouldShowFreezeButton={freeDraw}
          onResetInteractions={handleResetInteractions}
          onChangePreset={handleChangePreset}
          onToggleFreeze={handleToggleFreeze}
          onToggleHulls={handleToggleHulls}
          onToggleEdges={handleToggleEdges}
          onChangeHighlightIndex={handleChangeHighlightIndex}
          onToggleHighlighting={handleToggleHighlighting}
        />
      </div>
    </div>
  );
};

Narrative.propTypes = {
  stage: PropTypes.object.isRequired,
};

export default Narrative;

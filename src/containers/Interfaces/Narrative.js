import React, { Component } from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { get } from 'lodash';
import PropTypes from 'prop-types';
import ConvexHulls from '../Canvas/ConvexHulls';
import NodeLayout from '../Canvas/NodeLayout';
import Background from '../Canvas/Background';
import PresetSwitcher from '../Canvas/PresetSwitcher';
import Annotations from '../Canvas/Annotations';
import EdgeLayout from '../../components/Canvas/EdgeLayout';
import Canvas from '../../components/Canvas/Canvas';
import { getNetworkEdges, getNetworkNodes } from '../../selectors/network';
import { edgesToCoords } from '../../selectors/canvas';
import { entityAttributesProperty } from '../../utils/network-exporters/src/utils/reservedAttributes';

/**
  * Narrative Interface
  * @extends Component
  */
class Narrative extends Component {
  constructor(props) {
    super(props);
    this.state = {
      presetIndex: 0,
      showConvexHulls: true,
      showEdges: true,
      showHighlightedNodes: true,
      highlightIndex: 0,
      shouldShowResetButton: false,
      activeAnnotations: false,
      activeFocusNodes: false,
      isFrozen: false,
    };

    this.annotationLayer = React.createRef();
  }

  handleChangeActiveAnnotations = (status) => {
    this.setState({
      activeAnnotations: status,
    });
  }

  handleToggleHulls = () => {
    this.setState({
      showConvexHulls: !this.state.showConvexHulls,
    });
  }

  handleToggleEdges = () => {
    this.setState({
      showEdges: !this.state.showEdges,
    });
  }

  handleToggleHighlighting = () => {
    this.setState({
      showHighlightedNodes: !this.state.showHighlightedNodes,
    });
  }

  handleChangeHighlightIndex = (index) => {
    this.setState({
      highlightIndex: index,
    });
  }

  handleToggleFreeze = () => {
    this.setState({
      isFrozen: !this.state.isFrozen,
    });
  }

  handleResetInteractions = () => {
    this.annotationLayer.current.reset();
  }

  handleChangePreset = (index) => {
    if (index !== this.state.presetIndex) {
      this.setState({
        showConvexHulls: true,
        showEdges: true,
        showHighlightedNodes: true,
        highlightIndex: 0,
        presetIndex: index,
        activeAnnotations: false,
        activeFocusNodes: false,
      });
    }
  }

  render() {
    const {
      stage,
      nodes,
      edges,
    } = this.props;

    const presets = stage.presets;
    const currentPreset = presets[this.state.presetIndex];

    // Behaviour Configuration
    // eslint-disable-next-line @codaco/spellcheck/spell-checker
    const allowRepositioning = get(stage, 'behaviours.allowRepositioning', false);
    // eslint-disable-next-line @codaco/spellcheck/spell-checker
    const freeDraw = get(stage, 'behaviours.freeDraw', false);
    const shouldShowResetButton = this.state.activeAnnotations || this.state.activeFocusNodes;

    // Display Properties
    const layoutVariable = get(currentPreset, 'layoutVariable');
    const displayEdges = this.state.showEdges ? get(currentPreset, 'edges.display', []) : [];
    const highlight = get(currentPreset, 'highlight', []);
    const convexHullVariable = this.state.showConvexHulls ? get(currentPreset, 'groupVariable', '') : '';

    // Background Configuration
    const backgroundImage = get(stage, 'background.image');
    const concentricCircles = get(stage, 'background.concentricCircles');
    const skewedTowardCenter = get(stage, 'background.skewedTowardCenter');

    // Wrangled entities

    // NodeLayout and ConvexHulls should only be passed nodes that have
    // the layoutVariable set
    const nodesWithLayout = nodes.filter(node => node[entityAttributesProperty][layoutVariable]);

    // EdgeLayout should only be passed edges that are included in the presets
    // edges.display list
    const filteredEdges = edges.filter(edge => displayEdges.includes(edge.type));
    const edgesWithCoords = edgesToCoords(
      filteredEdges,
      { nodes: nodesWithLayout, layout: layoutVariable },
    );

    return (
      <div className="narrative-interface">
        <div className="narrative-interface__canvas" id="narrative-interface__canvas">
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
              nodes={nodesWithLayout}
              groupVariable={convexHullVariable}
              layoutVariable={layoutVariable}
            />
            <EdgeLayout
              edges={edgesWithCoords}
            />
            <Annotations
              ref={this.annotationLayer}
              isFrozen={this.state.isFrozen}
              onChangeActiveAnnotations={this.handleChangeActiveAnnotations}
            />
            <NodeLayout
              nodes={nodesWithLayout}
              id="NODE_LAYOUT"
              highlightAttribute={
                (this.state.showHighlightedNodes ? highlight[this.state.highlightIndex] : null)}
              layoutVariable={layoutVariable}
              allowPositioning={allowRepositioning}
            />
          </Canvas>
          <PresetSwitcher
            id="drop-obstacle"
            presets={presets}
            activePreset={this.state.presetIndex}
            highlightIndex={this.state.highlightIndex}
            isFrozen={this.state.isFrozen}
            shouldShowResetButton={shouldShowResetButton}
            shouldShowFreezeButton={freeDraw}
            onResetInteractions={this.handleResetInteractions}
            onChangePreset={this.handleChangePreset}
            onToggleFreeze={this.handleToggleFreeze}
            onToggleHulls={this.handleToggleHulls}
            onToggleEdges={this.handleToggleEdges}
            onChangeHighlightIndex={this.handleChangeHighlightIndex}
            onToggleHighlighting={this.handleToggleHighlighting}
          />
        </div>
      </div>
    );
  }
}

Narrative.propTypes = {
  stage: PropTypes.object.isRequired,
};

function mapStateToProps(state) {
  return {
    nodes: getNetworkNodes(state),
    edges: getNetworkEdges(state),
  };
}

const mapDispatchToProps = () => ({
});

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
)(Narrative);

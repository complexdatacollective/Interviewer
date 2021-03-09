import React, { Component } from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { get } from 'lodash';
import PropTypes from 'prop-types';

import { getProtocolStages } from '../../selectors/protocol';
import {
  PresetSwitcher,
  Annotations,
} from '../Canvas';
import {
  Canvas,
  ConcentricCircles,
} from '../../components/Canvas';

/**
  * Narrative Interface
  * @extends Component
  */
class Narrative extends Component {
  constructor(props) {
    super(props);
    this.state = {
      presetIndex: 0,
      showConvex: true,
      showEdges: true,
      showHighlights: true,
      highlightIndex: 0,
      activeAnnotations: false,
      activeFocusNodes: false,
      isFreeze: false,
    };

    this.annotationLayer = React.createRef();
  }

  setActiveStatus = (component, status) => {
    this.setState({
      [component]: status,
    });
  }

  toggleConvex = () => {
    const { showConvex } = this.state;
    this.setState({
      showConvex: !showConvex,
    });
  }

  toggleEdges = () => {
    const { showEdges } = this.state;
    this.setState({
      showEdges: !showEdges,
    });
  }

  toggleHighlights = () => {
    const { showHighlights } = this.state;
    this.setState({
      showHighlights: !showHighlights,
    });
  }

  toggleHighlightIndex = (index) => {
    this.setState({
      highlightIndex: index,
    });
  }

  toggleFreeze = () => {
    const { isFreeze } = this.state;
    this.setState({
      isFreeze: !isFreeze,
    });
  }

  resetInteractions = () => {
    this.annotationLayer.current.reset();
  }

  updatePreset = (index) => {
    const { presetIndex } = this.state;
    if (index !== presetIndex) {
      this.setState({
        showConvex: true,
        showEdges: true,
        showHighlights: true,
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
    } = this.props;
    const {
      presetIndex,
      activeFocusNodes,
      activeAnnotations,
      isFreeze,
      showHighlights,
      highlightIndex,
      showEdges,
      showConvex,
    } = this.state;

    const { subject } = stage;
    const { presets } = stage;
    const currentPreset = presets[presetIndex];
    const { layoutVariable } = currentPreset;
    const highlight = currentPreset.highlight || [];
    const displayEdges = (currentPreset.edges && currentPreset.edges.display) || [];
    const convexHulls = currentPreset.groupVariable;

    const backgroundImage = stage.background && stage.background.image;
    const concentricCircles = stage.background && stage.background.concentricCircles;
    const skewedTowardCenter = stage.background && stage.background.skewedTowardCenter;
    // eslint-disable-next-line @codaco/spellcheck/spell-checker
    const allowRepositioning = get(stage, 'behaviours.allowRepositioning', false);
    // eslint-disable-next-line @codaco/spellcheck/spell-checker
    const freeDraw = get(stage, 'behaviours.freeDraw', false);

    const showResetButton = activeAnnotations || activeFocusNodes;

    return (
      <div className="narrative-interface">
        <div className="narrative-interface__canvas" id="narrative-interface__canvas">
          <Canvas>
            { freeDraw
              && (
              <Annotations
                ref={this.annotationLayer}
                setActiveStatus={(status) => { this.setActiveStatus('activeAnnotations', status); }}
                key={`annotation-${currentPreset.id}`}
                isFreeze={isFreeze}
              />
              )}
            <ConcentricCircles
              subject={subject}
              layoutVariable={layoutVariable}
              highlightAttribute={
                (showHighlights ? highlight[highlightIndex] : null)
}
              displayEdges={(showEdges && displayEdges) || []}
              convexHulls={(showConvex && convexHulls) || ''}
              allowPositioning={allowRepositioning}
              backgroundImage={backgroundImage}
              concentricCircles={concentricCircles}
              skewedTowardCenter={skewedTowardCenter}
              key={`circles-${currentPreset.id}`}
              className="narrative-concentric-circles"
            />
          </Canvas>
          <PresetSwitcher
            id="preset-switcher"
            presets={presets}
            updatePreset={this.updatePreset}
            presetIndex={presetIndex}
            subject={subject}
            highlights={highlight}
            highlightIndex={highlightIndex}
            toggleHighlightIndex={this.toggleHighlightIndex}
            toggleHighlights={this.toggleHighlights}
            resetInteractions={this.resetInteractions}
            displayEdges={displayEdges}
            toggleEdges={this.toggleEdges}
            convexHulls={convexHulls}
            toggleConvex={this.toggleConvex}
            showResetButton={showResetButton}
            showFreezeButton={freeDraw}
            isFreeze={isFreeze}
            toggleFreeze={this.toggleFreeze}
          />
        </div>
      </div>
    );
  }
}

Narrative.propTypes = {
  stage: PropTypes.object.isRequired,
};

function mapStateToProps(state, ownProps) {
  return {
    stage: ownProps.stage || getProtocolStages(state)[ownProps.stageIndex],
  };
}

const mapDispatchToProps = () => ({
});

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
)(Narrative);

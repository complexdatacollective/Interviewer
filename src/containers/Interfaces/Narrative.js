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
      showResetButton: false,
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
    this.setState({
      showConvex: !this.state.showConvex,
    });
  }

  toggleEdges = () => {
    this.setState({
      showEdges: !this.state.showEdges,
    });
  }

  toggleHighlights = () => {
    this.setState({
      showHighlights: !this.state.showHighlights,
    });
  }

  toggleHighlightIndex = (index) => {
    this.setState({
      highlightIndex: index,
    });
  }

  toggleFreeze = () => {
    this.setState({
      isFreeze: !this.state.isFreeze,
    });
  }

  resetInteractions = () => {
    this.annotationLayer.current.reset();
  }

  updatePreset = (index) => {
    if (index !== this.state.presetIndex) {
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

    const { subject } = stage;
    const { presets } = stage;
    const currentPreset = presets[this.state.presetIndex];
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

    const showResetButton = this.state.activeAnnotations || this.state.activeFocusNodes;

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
                isFreeze={this.state.isFreeze}
              />
              )}
            <ConcentricCircles
              subject={subject}
              layoutVariable={layoutVariable}
              highlightAttribute={
                (this.state.showHighlights ? highlight[this.state.highlightIndex] : null)
}
              displayEdges={(this.state.showEdges && displayEdges) || []}
              convexHulls={(this.state.showConvex && convexHulls) || ''}
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
            presetIndex={this.state.presetIndex}
            subject={subject}
            highlights={highlight}
            highlightIndex={this.state.highlightIndex}
            toggleHighlightIndex={this.toggleHighlightIndex}
            toggleHighlights={this.toggleHighlights}
            resetInteractions={this.resetInteractions}
            displayEdges={displayEdges}
            toggleEdges={this.toggleEdges}
            convexHulls={convexHulls}
            toggleConvex={this.toggleConvex}
            showResetButton={showResetButton}
            showFreezeButton={freeDraw}
            isFreeze={this.state.isFreeze}
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

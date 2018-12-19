import React, { Component } from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import PropTypes from 'prop-types';

import { stages } from '../../selectors/session';
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
      showResetButton: false,
      activeAnnotations: false,
      activeFocusNodes: false,
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

  resetInteractions = () => {
    this.annotationLayer.current.reset();
  }

  updatePreset = (index) => {
    if (index !== this.state.presetIndex) {
      this.setState({
        showConvex: true,
        showEdges: true,
        showHighlights: true,
        presetIndex: index,
      });
    }
  }

  render() {
    const {
      stage,
    } = this.props;

    const subject = stage.subject;
    const presets = stage.presets;
    const currentPreset = presets[this.state.presetIndex];
    const layoutVariable = currentPreset.layoutVariable;
    const highlight = currentPreset.highlight;
    const displayEdges = (currentPreset.edges && currentPreset.edges.display) || [];
    const convexHulls = currentPreset.groupVariable;

    const backgroundImage = stage.background && stage.background.image;
    const concentricCircles = stage.background && stage.background.concentricCircles;
    const skewedTowardCenter = stage.background && stage.background.skewedTowardCenter;
    const freeDraw = stage.behaviours && stage.behaviours.freeDraw;

    const showResetButton = this.state.activeAnnotations || this.state.activeFocusNodes;

    return (
      <div className="narrative-interface">
        <div className="narrative-interface__canvas" id="narrative-interface__canvas">
          <Canvas>
            <Annotations
              ref={this.annotationLayer}
              freeDraw={freeDraw}
              setActiveStatus={(status) => { this.setActiveStatus('activeAnnotations', status); }}
            />
            <ConcentricCircles
              subject={subject}
              layoutVariable={layoutVariable}
              highlightAttributes={(this.state.showHighlights && highlight) || []}
              displayEdges={(this.state.showEdges && displayEdges) || []}
              convexHulls={(this.state.showConvex && convexHulls) || ''}
              backgroundImage={backgroundImage}
              concentricCircles={concentricCircles}
              skewedTowardCenter={skewedTowardCenter}
              key={currentPreset.id}
              className="narrative-concentric-circles"
            />
          </Canvas>
          <PresetSwitcher
            presets={presets}
            updatePreset={this.updatePreset}
            presetIndex={this.state.presetIndex}
            subject={subject}
            highlights={currentPreset.highlight}
            toggleHighlights={this.toggleHighlights}
            resetInteractions={this.resetInteractions}
            displayEdges={displayEdges}
            toggleEdges={this.toggleEdges}
            convexHulls={convexHulls}
            toggleConvex={this.toggleConvex}
            showResetButton={showResetButton}
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
    stage: ownProps.stage || stages(state)[ownProps.stageIndex],
  };
}

const mapDispatchToProps = () => ({
});

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
)(Narrative);

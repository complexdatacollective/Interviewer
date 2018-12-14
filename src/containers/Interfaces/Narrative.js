import React, { Component } from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import PropTypes from 'prop-types';

import { stages } from '../../selectors/session';
import {
  NarrativeControlPanel,
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
  constructor() {
    super();
    this.state = {
      presetIndex: 0,
      showConvex: true,
      showEdges: true,
      showHighlights: true,
    };
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
    const highlight = currentPreset.highlight && currentPreset.highlight[0].variable;
    const displayEdges = (currentPreset.edges && currentPreset.edges.display) || [];
    const convexHulls = currentPreset.groupVariable;

    const backgroundImage = stage.background && stage.background.image;
    const concentricCircles = stage.background && stage.background.concentricCircles;
    const skewedTowardCenter = stage.background && stage.background.skewedTowardCenter;
    const freeDraw = stage.behaviours && stage.behaviours.freeDraw;

    return (
      <div className="narrative-interface">
        <div className="narrative-interface__canvas" id="narrative-interface__canvas">
          <Canvas>
            <Annotations freeDraw={freeDraw} />
            <ConcentricCircles
              subject={subject}
              layoutVariable={layoutVariable}
              highlight={this.state.showHighlights && highlight}
              displayEdges={this.state.showEdges && displayEdges}
              convexHulls={this.state.showConvex && convexHulls}
              backgroundImage={backgroundImage}
              concentricCircles={concentricCircles}
              skewedTowardCenter={skewedTowardCenter}
              key={currentPreset.id}
            />
            <NarrativeControlPanel
              presets={presets}
              highlights={currentPreset.highlight}
              toggleHighlights={this.toggleHighlights}
              displayEdges={displayEdges}
              toggleEdges={this.toggleEdges}
              convexHulls={convexHulls}
              toggleConvex={this.toggleConvex}
              updatePreset={this.updatePreset}
            />
          </Canvas>
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

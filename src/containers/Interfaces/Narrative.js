import React, { Component } from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import PropTypes from 'prop-types';
import { uniq } from 'lodash';

import { stages } from '../../selectors/session';
import { networkEdges } from '../../selectors/interface';
import { getEdgeTypesFromPreset } from '../../selectors/canvas';
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
  static getDerivedStateFromProps(props, state) {
    const presetEdges = getEdgeTypesFromPreset(state, props);
    if (presetEdges !== state.presetEdges) {
      return {
        displayEdges: presetEdges,
        presetEdges,
      };
    }

    return null;
  }

  constructor() {
    super();
    this.state = {
      displayEdges: [],
      presetIndex: 0,
    };
  }

  toggleEdgeType = (index) => {
    const edgeId = this.props.edgeTypes[index];
    const updatedEdges = this.state.displayEdges.includes(edgeId) ?
      this.state.displayEdges.filter(edge => edge !== edgeId) :
      this.state.displayEdges.concat([edgeId]);
    this.setState({
      displayEdges: updatedEdges,
    });
  }

  updatePreset = (index) => {
    if (index !== this.state.presetIndex) {
      const displayEdges = (this.props.stage.presets[index].edges &&
        this.props.stage.presets[index].edges.display) || [];
      this.setState({
        displayEdges,
        presetIndex: index,
      });
    }
  }

  render() {
    const {
      edgeTypes,
      stage,
    } = this.props;

    const subject = stage.subject;
    const presets = stage.presets;
    const currentPreset = presets[this.state.presetIndex];
    const layoutVariable = currentPreset.layoutVariable;
    const highlight = currentPreset.highlight && currentPreset.highlight[0].variable;
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
              highlight={highlight}
              displayEdges={this.state.displayEdges}
              convexHulls={convexHulls}
              backgroundImage={backgroundImage}
              concentricCircles={concentricCircles}
              skewedTowardCenter={skewedTowardCenter}
              key={currentPreset.id}
            />
            <NarrativeControlPanel
              presets={presets}
              highlights={currentPreset.highlight}
              displayEdges={this.state.displayEdges}
              allEdgeTypes={edgeTypes}
              toggleEdgeType={this.toggleEdgeType}
              updatePreset={this.updatePreset}
            />
          </Canvas>
        </div>
      </div>
    );
  }
}

Narrative.propTypes = {
  edgeTypes: PropTypes.array.isRequired,
  stage: PropTypes.object.isRequired,
};

function mapStateToProps(state, ownProps) {
  const edges = networkEdges(state);

  return {
    stage: ownProps.stage || stages(state)[ownProps.stageIndex],
    edgeTypes: uniq(edges.map(edge => edge.type)),
  };
}

const mapDispatchToProps = () => ({
});

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
)(Narrative);

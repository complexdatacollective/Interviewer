/* eslint-disable */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import PropTypes from 'prop-types';
import {
  NarrativeControlPanel,
  Annotations,
  ConvexHulls,
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
  render() {
    return (
      <div className="narrative-interface">
        <div className="narrative-interface__canvas">
          <Canvas>
            <NarrativeControlPanel />
            <Annotations />
            <ConvexHulls />
            <ConcentricCircles />
          </Canvas>
        </div>
      </div>
    );
  }
}

Narrative.propTypes = {
  stage: PropTypes.object.isRequired,
};

const mapDispatchToProps = () => ({
});

export default compose(
  connect(null, mapDispatchToProps),
)(Narrative);

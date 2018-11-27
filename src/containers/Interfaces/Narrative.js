/* eslint-disable */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import PropTypes from 'prop-types';
import {
  Canvas,
  NarrativeControlPanel,
  Annotations,
  ConvexHulls,
  ConcentricCircles,
} from '../Canvas';

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
            {/*
              <ConcentricCircles />
              This component needs to be able to work without prompt/stage props
              Perhaps supplied with node lists and specific configuration options.
            */}
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

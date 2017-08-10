import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import {
  SociogramGraph,
  SociogramBackground,
  SociogramNodes,
  SociogramEdges,
} from '../Elements';

/**
  * Sociogram Interface
  * @extends Component
  */
class Sociogram extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedNode: null,
    };
  }

  render() {
    return (
      <div className="sociogram">
        <SociogramGraph>
          <SociogramBackground />
          <SociogramNodes />
          <SociogramEdges />
        </SociogramGraph>
      </div>
    );
  }
}

Sociogram.propTypes = {
  config: PropTypes.object.isRequired,
};

export default connect()(Sociogram);

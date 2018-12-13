import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { map, isEqual } from 'lodash';
import ConcaveMan from 'concaveman';
import { nodeAttributesProperty } from '../../ducks/modules/network';
import getAbsoluteBoundingRect from '../../utils/getAbsoluteBoundingRect';


const windowDimensions = getAbsoluteBoundingRect(document.body);

export class ConvexHull extends Component {
  shouldComponentUpdate(nextProps) {
    if (!isEqual(this.props.nodePoints, nextProps.nodePoints)) {
      return true;
    }
    return false;
  }

  generateHull = (nodeCollection) => {
    // Restructure as array of arrays of coords
    const groupAsCoords = map(nodeCollection, (node) => {
      const nodeCoords = node[nodeAttributesProperty][this.props.layoutVariable];
      return [nodeCoords.x, nodeCoords.y];
    });

    let hullPointsAsSVG = '';

    // See: https://github.com/mapbox/concaveman
    ConcaveMan(groupAsCoords, 0.6, 0).forEach((item) => {
      // Scale each hull point from ratio to window coordinate.
      const itemX = item[0] * windowDimensions.width;
      const itemY = item[1] * windowDimensions.height;

      // SVG points structured as string: "value1,value2 value3,value4"
      hullPointsAsSVG += `${itemX}, ${itemY} `;
    });

    return hullPointsAsSVG;
  }

  render() {
    const { color, nodePoints } = this.props;

    const hullClasses = `convex-hull convex-hull__${color}`;
    const hullPoints = this.generateHull(nodePoints);

    return (
      <svg className={hullClasses} xmlns="http://www.w3.org/2000/svg">
        <polygon points={hullPoints} />
      </svg>
    );
  }
}

ConvexHull.propTypes = {
  color: PropTypes.string,
  nodePoints: PropTypes.array.isRequired,
  layoutVariable: PropTypes.string.isRequired,
};

ConvexHull.defaultProps = {
  color: 'cat-color-seq-1',
};

export default ConvexHull;

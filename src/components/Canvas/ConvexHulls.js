import React from 'react';
import PropTypes from 'prop-types';
import { map } from 'lodash';
import ConcaveMan from 'concaveman';
import { ConvexHull } from './ConvexHull';
import { nodeAttributesProperty } from '../../ducks/modules/network';

class ConvexHulls extends React.PureComponent {
  generateHulls = (nodesByGroup) => {
    return map(nodesByGroup, (group) => {
      const groupCoords = map(group, (node) => {
        const coords = node[nodeAttributesProperty][this.props.layoutVariable];
        return [coords.x, coords.y];
      });
      return ConcaveMan(groupCoords);
    });
  };

  render() {
    const {
      nodesByGroup,
    } = this.props;


    const hulls = this.generateHulls(nodesByGroup);

    console.log(hulls);
    return (
      hulls.map((hull, index) => {
        const hullPoints = hull;

        return (
          <ConvexHull points={hullPoints} key={index} />
        );
      })
    );
  }
}

ConvexHulls.propTypes = {
  layoutVariable: PropTypes.string.isRequired,
  nodesByGroup: PropTypes.object.isRequired,
};

ConvexHulls.defaultProps = {
};


export default ConvexHulls;

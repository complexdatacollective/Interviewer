import React from 'react';
import PropTypes from 'prop-types';

import { ConvexHull } from './ConvexHull';


class ConvexHulls extends React.PureComponent {
  render() {
    const {
      nodesByGroup,
      layoutVariable,
    } = this.props;

    return (
      Object.keys(nodesByGroup).map((group, index) => {
        const color = `cat-color-seq-${index + 1}`;
        return (
          <ConvexHull
            color={color}
            nodePoints={nodesByGroup[group]}
            key={index}
            layoutVariable={layoutVariable}
          />
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

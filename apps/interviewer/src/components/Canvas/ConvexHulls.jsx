import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { findIndex } from 'lodash';
import getAbsoluteBoundingRect from '../../utils/getAbsoluteBoundingRect';
import { ConvexHull } from './ConvexHull';

const getColor = (group, options) => {
  const colorIndex = findIndex(options, ['value', group]) + 1 || 1;
  const color = `cat-color-seq-${colorIndex}`;
  return color;
};

class ConvexHulls extends Component {
  constructor() {
    super();

    this.hullComponent = React.createRef();
    this.state = {
      size: { width: 0, height: 0 },
    };
  }

  componentDidMount() {
    this.updateSize();
  }

  shouldComponentUpdate() {
    this.updateSize();
    return true;
  }

  updateSize = () => {
    const { size } = this.state;
    if (this.hullComponent.current && (
      size.width !== getAbsoluteBoundingRect(this.hullComponent.current).width
      || size.height !== getAbsoluteBoundingRect(this.hullComponent.current).height)) {
      this.setState({
        size: {
          width: getAbsoluteBoundingRect(this.hullComponent.current).width,
          height: getAbsoluteBoundingRect(this.hullComponent.current).height,
        },
      });
    }
  }

  render() {
    const {
      nodesByGroup,
      layoutVariable,
      categoricalOptions,
    } = this.props;
    const {
      size,
    } = this.state;

    return (
      <div style={{ width: '100%', height: '100%' }} ref={this.hullComponent}>
        {Object.values(nodesByGroup).map(({ group, nodes }, index) => {
          const color = getColor(group, categoricalOptions);
          return (
            <ConvexHull
              windowDimensions={size}
              color={color}
              nodePoints={nodes}
              key={index}
              layoutVariable={layoutVariable}
            />
          );
        })}
      </div>
    );
  }
}

ConvexHulls.propTypes = {
  layoutVariable: PropTypes.string.isRequired,
  nodesByGroup: PropTypes.object.isRequired,
  categoricalOptions: PropTypes.array,
};

ConvexHulls.defaultProps = {
  categoricalOptions: [],
};

export default ConvexHulls;

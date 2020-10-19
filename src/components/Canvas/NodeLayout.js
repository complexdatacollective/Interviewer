import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { isEmpty, has, isNil } from 'lodash';
import LayoutNode from '../../containers/Canvas/LayoutNode';
import { entityPrimaryKeyProperty, getEntityAttributes, entityAttributesProperty } from '../../ducks/modules/network';

class NodeLayout extends Component {
  static propTypes = {
    nodes: PropTypes.array,
    onSelected: PropTypes.func.isRequired,
    connectFrom: PropTypes.string,
    highlightAttribute: PropTypes.string,
    allowPositioning: PropTypes.bool,
    allowSelect: PropTypes.bool,
    layoutVariable: PropTypes.string,
    width: PropTypes.number,
    height: PropTypes.number,
  };

  static defaultProps = {
    connectFrom: null,
    nodes: [],
    highlightAttribute: null,
    allowPositioning: true,
    allowSelect: true,
    layoutVariable: null,
    width: null,
    height: null,
  };

  isHighlighted(node) {
    return !isEmpty(this.props.highlightAttribute) &&
      node[entityAttributesProperty][this.props.highlightAttribute] === true;
  }

  isLinking(node) {
    return node[entityPrimaryKeyProperty] === this.props.connectFrom;
  }

  render() {
    const {
      nodes,
      allowPositioning,
      allowSelect,
      layoutVariable,
      width,
      height,
    } = this.props;
    return (
      <div className="node-layout">
        { nodes.map((node) => {
          const nodeAttributes = getEntityAttributes(node);
          if (!has(nodeAttributes, layoutVariable) || isNil(nodeAttributes[layoutVariable])) {
            return null;
          }

          return (
            <LayoutNode
              key={node[entityPrimaryKeyProperty]}
              node={node}
              layoutVariable={layoutVariable}
              onSelected={() => this.props.onSelected(node)}
              selected={this.isHighlighted(node)}
              linking={this.isLinking(node)}
              allowPositioning={allowPositioning}
              allowSelect={allowSelect}
              areaWidth={width}
              areaHeight={height}
            />
          );
        }) }
      </div>
    );
  }
}

export { NodeLayout };

export default NodeLayout;

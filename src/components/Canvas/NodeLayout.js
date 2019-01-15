import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { isEmpty, isEqual, pick, has, isNil } from 'lodash';
import LayoutNode from '../../containers/Canvas/LayoutNode';
import { nodePrimaryKeyProperty, getNodeAttributes, nodeAttributesProperty } from '../../ducks/modules/network';

const watchProps = ['width', 'height', 'rerenderCount'];

const propsChangedExcludingNodes = (nextProps, props) =>
  !isEqual(pick(nextProps, watchProps), pick(props, watchProps));

const nodesLengthChanged = (nextProps, props) =>
  nextProps.nodes.length !== props.nodes.length;

class NodeLayout extends Component {
  static propTypes = {
    nodes: PropTypes.array,
    onSelected: PropTypes.func.isRequired,
    connectFrom: PropTypes.string,
    highlightAttributes: PropTypes.array,
    allowPositioning: PropTypes.bool,
    allowSelect: PropTypes.bool,
    layoutVariable: PropTypes.string,
    width: PropTypes.number,
    height: PropTypes.number,
  };

  static defaultProps = {
    connectFrom: null,
    nodes: [],
    highlightAttributes: [],
    allowPositioning: true,
    allowSelect: true,
    layoutVariable: null,
    width: null,
    height: null,
  };

  shouldComponentUpdate(nextProps) {
    if (nodesLengthChanged(nextProps, this.props)) { return true; }
    if (!isEqual(nextProps.highlightAttributes, this.props.highlightAttributes)) { return true; }
    if (propsChangedExcludingNodes(nextProps, this.props)) { return true; }

    return false;
  }

  getHighlightColor(node) {
    if (!this.isHighlighted(node)) return '';
    return this.props.highlightAttributes.find(
      attribute => node[nodeAttributesProperty][attribute.variable] === true).color;
  }

  isHighlighted(node) {
    return !isEmpty(this.props.highlightAttributes) &&
      !(isEmpty(this.props.highlightAttributes.find(
        attribute => node[nodeAttributesProperty][attribute.variable] === true)));
  }

  isLinking(node) {
    return node[nodePrimaryKeyProperty] === this.props.connectFrom;
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
          const nodeAttributes = getNodeAttributes(node);
          if (!has(nodeAttributes, layoutVariable) || isNil(nodeAttributes[layoutVariable])) {
            return null;
          }

          return (
            <LayoutNode
              key={node[nodePrimaryKeyProperty]}
              node={node}
              layoutVariable={layoutVariable}
              onSelected={() => this.props.onSelected(node)}
              selectedColor={this.getHighlightColor(node)}
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

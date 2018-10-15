import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { compose, withHandlers, withState } from 'recompose';
import { isEqual, isEmpty, pick, has } from 'lodash';
import LayoutNode from './LayoutNode';
import { withBounds } from '../../behaviours';
import { makeGetSociogramOptions, makeGetPlacedNodes } from '../../selectors/sociogram';
import { actionCreators as sessionsActions } from '../../ducks/modules/sessions';
import { nodePrimaryKeyProperty, getNodeAttributes, nodeAttributesProperty } from '../../ducks/modules/network';
import { DropTarget } from '../../behaviours/DragAndDrop';
import sociogramOptionsProps from './propTypes';

const watchProps = ['width', 'height', 'dropCount'];

const propsChangedExcludingNodes = (nextProps, props) =>
  !isEqual(pick(nextProps, watchProps), pick(props, watchProps));

const nodesLengthChanged = (nextProps, props) =>
  nextProps.nodes.length !== props.nodes.length;

const relativeCoords = (container, node) => ({
  x: (node.x - container.x) / container.width,
  y: (node.y - container.y) / container.height,
});

const dropHandlers = compose(
  withState('dropCount', 'setDropCount', 0),
  withHandlers({
    accepts: () => ({ meta }) => meta.itemType === 'POSITIONED_NODE',
    onDrop: props => (item) => {
      props.updateNode(
        item.meta,
        {
          [props.layoutVariable]: relativeCoords(props, item),
        },
      );

      // Horrible hack for performance (only re-render nodes on drop, not on drag)
      props.setDropCount(props.dropCount + 1);
    },
    onDrag: props => (item) => {
      if (!has(item.meta[nodeAttributesProperty], props.layoutVariable)) { return; }

      props.updateNode(
        item.meta,
        {
          [props.layoutVariable]: relativeCoords(props, item),
        },
      );
    },
    onDragEnd: props => (item) => {
      if (!has(item.meta[nodeAttributesProperty], props.layoutVariable)) { return; }

      // make sure to also re-render nodes that were updated on drag end
      props.setDropCount(props.dropCount + 1);
    },
  }),
);

class NodeLayout extends Component {
  static propTypes = {
    nodes: PropTypes.array,
    toggleEdge: PropTypes.func.isRequired,
    toggleHighlight: PropTypes.func.isRequired,
    connectFrom: PropTypes.string,
    ...sociogramOptionsProps,
  };

  static defaultProps = {
    connectFrom: null,
    nodes: [],
    allowPositioning: true,
    allowSelect: true,
  };

  shouldComponentUpdate(nextProps) {
    if (nodesLengthChanged(nextProps, this.props)) { return true; }
    if (propsChangedExcludingNodes(nextProps, this.props)) { return true; }

    return false;
  }

  onSelected = (node) => {
    const {
      allowSelect,
    } = this.props;

    if (!allowSelect) { return; }

    this.connectNode(node[nodePrimaryKeyProperty]);

    this.toggleHighlightAttribute(node);

    this.forceUpdate();
  }

  connectNode(nodeId) {
    const { createEdge, canCreateEdge, connectFrom } = this.props;

    if (!canCreateEdge) { return; }

    if (!connectFrom) {
      this.props.updateLinkFrom(nodeId);
      return;
    }

    if (connectFrom !== nodeId) {
      this.props.toggleEdge({
        from: connectFrom,
        to: nodeId,
        type: createEdge,
      });
    }

    this.props.updateLinkFrom(null);
  }

  toggleHighlightAttribute(node) {
    if (!this.props.allowHighlighting) { return; }
    const newVal = !node[nodeAttributesProperty][this.props.highlightAttribute];
    this.props.toggleHighlight(
      node[nodePrimaryKeyProperty],
      { [this.props.highlightAttribute]: newVal },
    );
  }

  isHighlighted(node) {
    return !isEmpty(this.props.highlightAttribute) &&
      node[nodeAttributesProperty][this.props.highlightAttribute] === true;
  }

  isLinking(node) {
    return this.props.allowSelect &&
      this.props.canCreateEdge &&
      node[nodePrimaryKeyProperty] === this.props.connectFrom;
  }

  render() {
    const {
      nodes,
      allowPositioning,
      allowSelect,
      layoutVariable,
    } = this.props;

    return (
      <div className="node-layout">
        { nodes.map((node) => {
          const nodeAttributes = getNodeAttributes(node);
          if (!has(nodeAttributes, layoutVariable)) { return null; }

          return (
            <LayoutNode
              key={node[nodePrimaryKeyProperty]}
              node={node}
              layoutVariable={layoutVariable}
              onSelected={() => this.onSelected(node)}
              selected={this.isHighlighted(node)}
              linking={this.isLinking(node)}
              allowPositioning={allowPositioning}
              allowSelect={allowSelect}
              areaWidth={this.props.width}
              areaHeight={this.props.height}
            />
          );
        }) }
      </div>
    );
  }
}

function makeMapStateToProps() {
  const getPlacedNodes = makeGetPlacedNodes();
  const getSociogramOptions = makeGetSociogramOptions();

  return function mapStateToProps(state, props) {
    return {
      nodes: getPlacedNodes(state, props),
      ...getSociogramOptions(state, props),
    };
  };
}

function mapDispatchToProps(dispatch) {
  return {
    toggleHighlight: bindActionCreators(sessionsActions.toggleNodeAttributes, dispatch),
    toggleEdge: bindActionCreators(sessionsActions.toggleEdge, dispatch),
    updateNode: bindActionCreators(sessionsActions.updateNode, dispatch),
  };
}

export { NodeLayout };

export default compose(
  connect(makeMapStateToProps, mapDispatchToProps),
  withBounds,
  dropHandlers,
  DropTarget,
)(NodeLayout);

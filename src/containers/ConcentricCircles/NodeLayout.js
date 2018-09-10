import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { compose, withHandlers, withState } from 'recompose';
import { isEqual, isEmpty, pick, isMatch, has } from 'lodash';
import LayoutNode from './LayoutNode';
import { withBounds } from '../../behaviours';
import { makeGetSociogramOptions, makeGetPlacedNodes } from '../../selectors/sociogram';
import { actionCreators as sessionsActions } from '../../ducks/modules/sessions';
import { nodePrimaryKeyProperty, getNodeAttributes } from '../../ducks/modules/network';
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
        {
          [nodePrimaryKeyProperty]: item.meta[nodePrimaryKeyProperty],
        },
        {
          [props.layoutVariable]: relativeCoords(props, item),
        },
      );

      // Horrible hack for performance (only re-render nodes on drop, not on drag)
      props.setDropCount(props.dropCount + 1);
    },
    onDrag: props => (item) => {
      if (!has(item.meta, props.layoutVariable)) { return; }

      props.updateNode(
        {
          [nodePrimaryKeyProperty]: item.meta[nodePrimaryKeyProperty],
        },
        {
          [props.layoutVariable]: relativeCoords(props, item),
        },
      );
    },
  }),
);

class NodeLayout extends Component {
  static propTypes = {
    nodes: PropTypes.array,
    toggleEdge: PropTypes.func.isRequired,
    toggleHighlight: PropTypes.func.isRequired,
    ...sociogramOptionsProps,
  };

  static defaultProps = {
    nodes: [],
    allowPositioning: true,
    allowSelect: true,
  };

  constructor(props) {
    super(props);

    this.state = {
      connectFrom: null,
    };
  }

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

    this.toggleHighlightAttributes(node[nodePrimaryKeyProperty]);

    this.forceUpdate();
  }

  connectNode(nodeId) {
    const { createEdge, canCreateEdge } = this.props;
    const { connectFrom } = this.state;

    if (!canCreateEdge) { return; }

    if (!connectFrom) {
      this.setState({ connectFrom: nodeId });
      return;
    }

    if (connectFrom !== nodeId) {
      this.props.toggleEdge({
        from: connectFrom,
        to: nodeId,
        type: createEdge,
      });
    }

    this.setState({ connectFrom: null });
  }

  toggleHighlightAttributes(nodeId) {
    if (!this.props.allowHighlighting) { return; }

    this.props.toggleHighlight(
      nodeId,
      { ...this.props.highlightAttributes },
    );
  }

  isHighlighted(node) {
    return !isEmpty(this.props.highlightAttributes) &&
      isMatch(node, this.props.highlightAttributes);
  }

  isLinking(node) {
    return this.props.allowSelect &&
      this.props.canCreateEdge &&
      node[nodePrimaryKeyProperty] === this.state.connectFrom;
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

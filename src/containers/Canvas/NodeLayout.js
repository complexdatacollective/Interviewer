import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { compose, withHandlers, withState } from 'recompose';
import { has } from 'lodash';
import { withBounds } from '../../behaviours';
import { actionCreators as sessionsActions } from '../../ducks/modules/sessions';
import { nodePrimaryKeyProperty, nodeAttributesProperty } from '../../ducks/modules/network';
import { DropTarget } from '../../behaviours/DragAndDrop';
import NodeLayout from '../../components/Canvas/NodeLayout';
import { makeGetPlacedNodes } from '../../selectors/canvas';

const relativeCoords = (container, node) => ({
  x: (node.x - container.x) / container.width,
  y: (node.y - container.y) / container.height,
});

const withRerenderCount = withState('rerenderCount', 'setRerenderCount', 0);

const withDropHandlers = withHandlers({
  accepts: () => ({ meta }) => meta.itemType === 'POSITIONED_NODE',
  onDrop: ({ updateNode, layout, setRerenderCount, rerenderCount, width, height, x, y }) =>
    (item) => {
      updateNode(
        item.meta,
        {
          [layout]: relativeCoords({ width, height, x, y }, item),
        },
      );

      // Horrible hack for performance (only re-render nodes on drop, not on drag)
      setRerenderCount(rerenderCount + 1);
    },
  onDrag: ({ layout, updateNode, width, height, x, y }) => (item) => {
    if (!has(item.meta[nodeAttributesProperty], layout)) { return; }

    updateNode(
      item.meta,
      {
        [layout]: relativeCoords({ width, height, x, y }, item),
      },
    );
  },
  onDragEnd: ({ layout, setRerenderCount, rerenderCount }) => (item) => {
    if (!has(item.meta[nodeAttributesProperty], layout)) { return; }

    // make sure to also re-render nodes that were updated on drag end
    setRerenderCount(rerenderCount + 1);
  },
});

const withSelectHandlers = compose(
  withHandlers({
    connectNode: ({ createEdge, connectFrom, updateLinkFrom, toggleEdge }) =>
      (nodeId) => {
        if (!createEdge) { return; }

        if (!connectFrom) {
          updateLinkFrom(nodeId);
          return;
        }

        if (connectFrom !== nodeId) {
          toggleEdge({
            from: connectFrom,
            to: nodeId,
            type: createEdge,
          });
        }

        updateLinkFrom(null);
      },
    toggleHighlightAttribute: ({ allowHighlighting, highlight, toggleHighlight }) =>
      (node) => {
        if (!allowHighlighting) { return; }
        const newVal = !node[nodeAttributesProperty][highlight];
        toggleHighlight(
          node[nodePrimaryKeyProperty],
          { [highlight]: newVal },
        );
      },
  }),
  withHandlers({
    onSelected: ({
      allowSelect,
      connectNode,
      toggleHighlightAttribute,
      setRerenderCount,
      rerenderCount,
    }) => (node) => {
      if (!allowSelect) { return; }

      connectNode(node[nodePrimaryKeyProperty]);
      toggleHighlightAttribute(node);
      setRerenderCount(rerenderCount + 1);
    },
  }),
);

function makeMapStateToProps() {
  const getPlacedNodes = makeGetPlacedNodes();

  return function mapStateToProps(state, { createEdge, allowHighlighting, subject, layout }) {
    const allowSelect = createEdge || allowHighlighting;

    return {
      nodes: getPlacedNodes(state, { subject, layout }),
      allowSelect,
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

export default compose(
  connect(makeMapStateToProps, mapDispatchToProps),
  withBounds,
  withRerenderCount,
  withDropHandlers,
  withSelectHandlers,
  DropTarget,
)(NodeLayout);

import { bindActionCreators } from 'redux';
import { isNil } from 'lodash';
import { connect } from 'react-redux';
import { compose, withHandlers, withState } from 'recompose';
import { withBounds } from '../../behaviours';
import { actionCreators as sessionsActions } from '../../ducks/modules/sessions';
import { entityPrimaryKeyProperty, entityAttributesProperty } from '../../ducks/modules/network';
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
  onDrop: ({
    updateNode, layoutVariable, setRerenderCount, rerenderCount, width, height, x, y,
  }) => (item) => {
    updateNode(
      item.meta[entityPrimaryKeyProperty],
      {},
      {
        [layoutVariable]: relativeCoords({
          width, height, x, y,
        }, item),
      },
    );

    // Horrible hack for performance (only re-render nodes on drop, not on drag)
    setRerenderCount(rerenderCount + 1);
  },
  onDrag: ({
    layoutVariable, updateNode, width, height, x, y,
  }) => (item) => {
    if (isNil(item.meta[entityAttributesProperty][layoutVariable])) { return; }
    updateNode(
      item.meta[entityPrimaryKeyProperty],
      {},
      {
        [layoutVariable]: relativeCoords({
          width, height, x, y,
        }, item),
      },
    );
  },
  onDragEnd: ({ setRerenderCount, rerenderCount }) => () => {
    // make sure to also re-render nodes that were updated on drag end
    setRerenderCount(rerenderCount + 1);
  },
});

const withSelectHandlers = compose(
  withHandlers({
    connectNode: ({
      createEdge,
      connectFrom,
      updateLinkFrom,
      toggleEdge,
    }) => (nodeId) => {
      // If edge creation is disabled, return
      if (!createEdge) { return; }

      // If the target and source node are the same, deselect
      if (connectFrom === nodeId) {
        updateLinkFrom(null);
        return;
      }

      // If there isn't a target node yet, set the selected node into the linking state
      if (!connectFrom) {
        updateLinkFrom(nodeId);
        return;
      }

      // Either add or remove an edge
      if (connectFrom !== nodeId) {
        toggleEdge({
          from: connectFrom,
          to: nodeId,
          type: createEdge,
        });
      }

      // Reset the node linking state
      updateLinkFrom(null);
    },
    toggleHighlightAttribute: ({ allowHighlighting, highlightAttribute, toggleHighlight }) => (node) => {
      if (!allowHighlighting) { return; }
      const newVal = !node[entityAttributesProperty][highlightAttribute];
      toggleHighlight(
        node[entityPrimaryKeyProperty],
        { [highlightAttribute]: newVal },
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

      connectNode(node[entityPrimaryKeyProperty]);
      toggleHighlightAttribute(node);
      setRerenderCount(rerenderCount + 1);
    },
  }),
);

function makeMapStateToProps() {
  const getPlacedNodes = makeGetPlacedNodes();

  return function mapStateToProps(
    state,
    {
      createEdge, allowHighlighting, subject, layoutVariable, stage,
    },
  ) {
    const allowSelect = !!(createEdge || allowHighlighting);

    return {
      nodes: getPlacedNodes(state, { subject, layoutVariable, stage }),
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

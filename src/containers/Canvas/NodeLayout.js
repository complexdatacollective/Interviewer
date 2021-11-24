import { connect } from 'react-redux';
import { compose, withHandlers, withState } from 'recompose';
import { withBounds } from '../../behaviours';
import { actionCreators as sessionsActions } from '../../ducks/modules/sessions';
import { entityPrimaryKeyProperty, entityAttributesProperty } from '../../ducks/modules/network';
import { DropTarget } from '../../behaviours/DragAndDrop';
import NodeLayout from '../../components/RealtimeCanvas/NodeLayout';

const relativeCoords = (container, node) => ({
  x: (node.x - container.x) / container.width,
  y: (node.y - container.y) / container.height,
});

const withConnectFrom = withState('connectFrom', 'setConnectFrom', null);

const withConnectFromHandler = withHandlers({
  handleConnectFrom: ({ setConnectFrom }) => (id) => setConnectFrom(id),
  handleResetConnectFrom: ({ setConnectFrom }) => () => setConnectFrom(null),
});

const withDropHandlers = withHandlers({
  accepts: () => ({ meta }) => meta.itemType === 'POSITIONED_NODE',
  onDrop: ({
    updateNode, layoutVariable, width, height, x, y,
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
  },
});

const withSelectHandlers = compose(
  withHandlers({
    connectNode: ({
      createEdge,
      connectFrom,
      handleConnectFrom,
      toggleEdge,
    }) => (nodeId) => {
      // If edge creation is disabled, return
      if (!createEdge) { return; }

      // If the target and source node are the same, deselect
      if (connectFrom === nodeId) {
        handleConnectFrom(null);
        return;
      }

      // If there isn't a target node yet, set the selected node into the linking state
      if (!connectFrom) {
        handleConnectFrom(nodeId);
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
      handleConnectFrom(null);
    },
    toggleHighlightAttribute: ({
      allowHighlighting, highlightAttribute, toggleHighlight,
    }) => (node) => {
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
      allowHighlighting,
      connectNode,
      toggleHighlightAttribute,
    }) => (node) => {
      if (!allowHighlighting) {
        connectNode(node[entityPrimaryKeyProperty]);
      } else {
        toggleHighlightAttribute(node);
      }
    },
  }),
);

const mapDispatchToProps = {
  toggleHighlight: sessionsActions.toggleNodeAttributes,
  toggleEdge: sessionsActions.toggleEdge,
  updateNode: sessionsActions.updateNode,
};

export default compose(
  withConnectFrom,
  withConnectFromHandler,
  connect(null, mapDispatchToProps),
  withBounds,
  withDropHandlers,
  withSelectHandlers,
  DropTarget,
)(NodeLayout);

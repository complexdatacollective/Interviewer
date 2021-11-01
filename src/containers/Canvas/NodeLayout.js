import { bindActionCreators } from 'redux';
import { isNil } from 'lodash';
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
  // onDrag: ({
  //   layoutVariable, updateNode, width, height, x, y,
  // }) => (item) => {
  //   if (isNil(item.meta[entityAttributesProperty][layoutVariable])) { return; }
  //   updateNode(
  //     item.meta[entityPrimaryKeyProperty],
  //     {},
  //     {
  //       [layoutVariable]: relativeCoords({
  //         width, height, x, y,
  //       }, item),
  //     },
  //   );
  // },
  // onDragEnd: ({ setRerenderCount, rerenderCount }) => () => {
  //   // make sure to also re-render nodes that were updated on drag end
  //   setRerenderCount(rerenderCount + 1);
  // },
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
      setRerenderCount,
      rerenderCount,
    }) => (node) => {
      if (!allowHighlighting) {
        connectNode(node[entityPrimaryKeyProperty]);
      } else {
        toggleHighlightAttribute(node);
      }
      setRerenderCount(rerenderCount + 1);
    },
  }),
);

function mapDispatchToProps(dispatch) {
  return {
    toggleHighlight: bindActionCreators(sessionsActions.toggleNodeAttributes, dispatch),
    toggleEdge: bindActionCreators(sessionsActions.toggleEdge, dispatch),
    updateNode: bindActionCreators(sessionsActions.updateNode, dispatch),
  };
}

export default compose(
  withConnectFrom,
  withConnectFromHandler,
  connect(null, mapDispatchToProps),
  withBounds,
  withRerenderCount,
  withDropHandlers,
  withSelectHandlers,
  DropTarget,
)(NodeLayout);

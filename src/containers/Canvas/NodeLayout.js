import { bindActionCreators } from 'redux';
import { isNil, clamp, get } from 'lodash';
import { connect } from 'react-redux';
import { compose, withHandlers, withState } from 'recompose';
import { entityAttributesProperty, entityPrimaryKeyProperty } from '@codaco/shared-consts';
import { withBounds } from '../../behaviours';
import { actionCreators as sessionsActions } from '../../ducks/modules/sessions';
import { DropTarget } from '../../behaviours/DragAndDrop';
import NodeLayout from '../../components/Canvas/NodeLayout';

const relativeCoords = (container, node) => ({
  x: clamp((node.x - container.x) / container.width, 0, 1),
  y: clamp((node.y - container.y) / container.height, 0, 1),
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
    updateNode, layout, twoMode, setRerenderCount, rerenderCount, width, height, x, y,
  }) => (item) => {
    const layoutVariable = twoMode ? layout[item.type] : layout;

    updateNode(
      item.meta[entityPrimaryKeyProperty],
      {},
      {
        [layoutVariable]: relativeCoords({
          width,
          height,
          x,
          y,
        }, item),
      },
    );

    // Horrible hack for performance (only re-render nodes on drop, not on drag)
    setRerenderCount(rerenderCount + 1);
  },
  onDrag: ({
    layout, twoMode, updateNode, width, height, x, y,
  }) => (item) => {
    const layoutVariable = twoMode ? layout[item.type] : layout;

    if (isNil(item.meta[entityAttributesProperty][layoutVariable])) { return; }
    updateNode(
      item.meta[entityPrimaryKeyProperty],
      {},
      {
        [layoutVariable]: relativeCoords({
          width,
          height,
          x,
          y,
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
      nodes,
      createEdge,
      connectFrom,
      handleConnectFrom,
      toggleEdge,
      originRestriction,
    }) => (nodeId) => {
      // If edge creation is disabled, return
      if (!createEdge) { return; }

      // If the target and source node are the same, deselect
      if (connectFrom === nodeId) {
        handleConnectFrom(null);
        return;
      }

      // If there isn't a target node yet, and the type isn't restricted,
      // set the selected node into the linking state
      if (!connectFrom) {
        const nodeType = get(nodes, [nodeId, 'type']);
        if (originRestriction && nodeType !== originRestriction) { return; }
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

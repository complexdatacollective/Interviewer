import React, { useState, useCallback, useRef } from 'react';
import { isNil } from 'lodash';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { actionCreators as sessionsActions } from '../../ducks/modules/sessions';
import { entityPrimaryKeyProperty, entityAttributesProperty } from '../../ducks/modules/network';
// import { DropTarget } from '../../behaviours/DragAndDrop';
import NodeLayoutComponent from '../../components/Canvas/NodeLayout';
import useSize from '../../hooks/useSize';

const relativeCoords = (container, node) => ({
  x: (node.x - container.x) / container.width,
  y: (node.y - container.y) / container.height,
});

const accepts = ({ meta }) => meta.itemType === 'POSITIONED_NODE';

const NodeLayout = (props) => {
  const {
    onChange,
    createEdge,
    updateNode,
    toggleEdge,
    allowHighlighting,
    highlightAttribute,
    toggleHighlight,
    layoutVariable,
  } = props;

  const ref = useRef();
  const size = useSize(ref);

  const [connectFrom, setConnectFrom] = useState(null);
  const [rerenderCount, setRerenderCount] = useState(null);
  // Horrible hack for performance (only re-render nodes on drop, not on drag)
  const incrementRerenderCount = useCallback(() => setRerenderCount((c) => c + 1), []);
  const resetConnectFrom = useCallback(() => setConnectFrom(null), []);

  const onDrop = (item) => {
    const id = item.meta[entityPrimaryKeyProperty];
    const {
      width,
      height,
      x,
      y,
    } = size.current;

    updateNode(
      id,
      {},
      {
        [layoutVariable]: relativeCoords(
          {
            width, height, x, y,
          },
          item,
        ),
      },
    );

    onChange({
      type: 'node',
      id,
    });

    incrementRerenderCount();
  };

  const onDrag = (item) => {
    if (isNil(item.meta[entityAttributesProperty][layoutVariable])) { return; }
    const id = item.meta[entityPrimaryKeyProperty];
    const {
      width,
      height,
      x,
      y,
    } = size.current;
    updateNode(
      id,
      {},
      {
        [layoutVariable]: relativeCoords({
          width, height, x, y,
        }, item),
      },
    );

    onChange({
      type: 'node',
      id,
    });
  };

  const onDragEnd = () => {
    // make sure to also re-render nodes that were updated on drag end
    incrementRerenderCount();
  };

  const connectNode = useCallback((nodeId) => {
    // If edge creation is disabled, return
    if (!createEdge) { return; }

    // If the target and source node are the same, deselect
    if (connectFrom === nodeId) {
      resetConnectFrom();
      return;
    }

    // If there isn't a target node yet, set the selected node into the linking state
    if (!connectFrom) {
      setConnectFrom(nodeId);
      return;
    }

    // Either add or remove an edge
    if (connectFrom !== nodeId) {
      toggleEdge({
        from: connectFrom,
        to: nodeId,
        type: createEdge,
      });

      onChange({
        type: 'edge',
        from: connectFrom,
        to: nodeId,
      });
    }

    // Reset the node linking state
    resetConnectFrom();
  }, [createEdge, connectFrom, resetConnectFrom, setConnectFrom, toggleEdge]);

  const toggleHighlightAttribute = useCallback((node) => {
    if (!allowHighlighting) { return; }

    const newVal = !node[entityAttributesProperty][highlightAttribute];

    toggleHighlight(
      node[entityPrimaryKeyProperty],
      { [highlightAttribute]: newVal },
    );
  }, [allowHighlighting, highlightAttribute, toggleHighlight]);

  const onSelected = useCallback((node) => {
    console.log({ node, allowHighlighting });
    if (!allowHighlighting) {
      connectNode(node[entityPrimaryKeyProperty]);
    } else {
      toggleHighlightAttribute(node);
    }
    incrementRerenderCount();
  }, [allowHighlighting, incrementRerenderCount, connectNode, toggleHighlightAttribute]);

  return (
    <NodeLayoutComponent
      accepts={accepts}
      onDrag={onDrag}
      onDragEnd={onDragEnd}
      onDrop={onDrop}
      onSelected={onSelected}
      rerenderCount={rerenderCount}
      connectFrom={connectFrom}
      ref={ref}
      {...props}
    />
  );
};

const mapDispatchToProps = {
  toggleHighlight: sessionsActions.toggleNodeAttributes,
  toggleEdge: sessionsActions.toggleEdge,
  updateNode: sessionsActions.updateNode,
};

export default compose(
  connect(null, mapDispatchToProps),
)(NodeLayout);

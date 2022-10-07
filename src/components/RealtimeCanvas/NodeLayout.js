/* eslint-disable no-param-reassign */
import React, {
  useCallback, useContext, useEffect, useMemo, useRef, useState,
} from 'react';
import { useDispatch } from 'react-redux';
import { entityPrimaryKeyProperty, entityAttributesProperty } from '@codaco/shared-consts';
import { isEmpty, get, find } from 'lodash';
import { actionCreators as sessionsActions } from '../../ducks/modules/sessions';
import LayoutContext from '../../contexts/LayoutContext';
import LayoutNode from './LayoutNode';
import { calculateScreenCoords } from './ScreenManager';

const NodeLayout = (props) => {
  const {
    allowPositioning,
    allowSelecting,
    allowEdgeCreation,
    highlightAttribute,
    destinationRestriction,
    originRestriction,
    createEdge,
  } = props;

  const {
    nodes,
    handleDrag,
    handleDragEnd,
    getLayoutNodePosition,
    screen,
    interfaceRef,
  } = useContext(LayoutContext);

  const currentScreenDimensions = useMemo(screen.current.get, [screen.current]);

  const dispatch = useDispatch();
  const updateRAF = useRef(null);
  const [layoutNodeElements, setLayoutNodeElements] = useState([]);
  const [connectFrom, setConnectFrom] = useState(null);

  const isLinking = useCallback(
    (node) => get(node, entityPrimaryKeyProperty) === connectFrom,
    [connectFrom],
  );

  const isHighlighted = useCallback((node) => (
    !isEmpty(highlightAttribute)
    && get(node, [entityAttributesProperty, highlightAttribute]) === true
  ), [highlightAttribute]);

  const isDisabled = useCallback((node) => {
    // Node is disabled if type is same as originRestriction, unless there is a connectFrom
    // If there is a connectFrom, we need to check other things.
    if (!connectFrom && originRestriction && node.type === originRestriction) { return true; }

    // Not disabled if we aren't linking, or if the node is the origin
    if (!connectFrom || connectFrom === node[entityPrimaryKeyProperty]) { return false; }

    const originType = find(nodes, [entityPrimaryKeyProperty, connectFrom]).type;
    const thisType = get(node, 'type');

    if (destinationRestriction === 'same') {
      return thisType !== originType;
    }

    if (destinationRestriction === 'different') {
      return thisType === originType;
    }

    return false;
  }, [connectFrom, originRestriction, destinationRestriction]);

  /**
   * Create DOM elements from each of the layout nodes, which we can manipulate
   * outside of the React render cycle.
   */
  const createLayoutNodeElements = useCallback(() => {
    const newEls = nodes.map((_, index) => {
      // If a node already exists, use it
      if (layoutNodeElements[index]) { return layoutNodeElements[index]; }

      const nodeEl = document.createElement('div');
      nodeEl.style.position = 'absolute';
      nodeEl.style.transform = 'translate(-50%, -50%)';
      nodeEl.style.display = 'none'; // Hide until we have a position
      document.getElementsByClassName('sociogram-interface')[0].append(nodeEl);

      return nodeEl;
    });

    setLayoutNodeElements(newEls);
  }, [nodes, interfaceRef]);

  /**
   * Establish an update loop running on each animation frame that updates the
   * layout node elements with the latest positions.
   *
   * Positions either come from the simulation, OR from existing node layout
   * data (in the case of manual layout).
   */
  const update = useCallback(() => {
    // Need to optimize this to only update the nodes that have changed
    layoutNodeElements.forEach((el, index) => {
      const relativePosition = getLayoutNodePosition(index);
      if (!relativePosition || !el) { return; }

      const screenPosition = calculateScreenCoords(relativePosition, currentScreenDimensions);
      console.log('screenPosition', screenPosition);
      el.style.left = `${screenPosition.x}px`;
      el.style.top = `${screenPosition.y}px`;
      el.style.display = 'block';
    });
    updateRAF.current = requestAnimationFrame(() => update());
  }, [layoutNodeElements, currentScreenDimensions, getLayoutNodePosition]);

  /**
   * If the node or edge lists change, recreate the layout node elements.
   */
  useEffect(() => {
    // TODO: Handle removal of nodes!
    if (layoutNodeElements.length !== nodes.length) {
      createLayoutNodeElements();
    }
  }, [nodes, layoutNodeElements, createLayoutNodeElements]);

  /**
   * Start the update loop on first render
   */
  useEffect(() => {
    updateRAF.current = requestAnimationFrame(() => update());

    return () => {
      cancelAnimationFrame(updateRAF.current);
    };
  }, [update]);

  const handleEdgeCreation = useCallback((nodeId) => {
    // If edge creation is disabled, return
    if (!allowEdgeCreation || !createEdge) { return; }

    // If the target and source node are the same, deselect
    if (connectFrom === nodeId) {
      setConnectFrom(null);
      return;
    }

    // If there isn't a target node yet, and the type isn't restricted,
    // set the selected node into the linking state
    if (!connectFrom) {
      const { type: nodeType } = find(nodes, [entityPrimaryKeyProperty, nodeId]);
      // If the node type is restricted, return
      if (originRestriction && nodeType === originRestriction) { return; }

      setConnectFrom(nodeId);
      return;
    }

    // Either add or remove an edge
    if (connectFrom !== nodeId) {
      dispatch(sessionsActions.toggleEdge({
        from: connectFrom,
        to: nodeId,
        type: createEdge,
      }));
    }

    // Reset the node linking state
    setConnectFrom(null);
  }, [connectFrom, originRestriction, createEdge, nodes]);

  const toggleHighlightAttribute = useCallback((node) => {
    if (!allowSelecting) { return; }
    const newVal = !node[entityAttributesProperty][highlightAttribute];

    dispatch(
      sessionsActions.toggleNodeAttributes(
        node[entityPrimaryKeyProperty],
        { [highlightAttribute]: newVal },
      ),
    );
  }, [allowSelecting, highlightAttribute]);

  const onSelected = useCallback((node) => {
    if (!allowSelecting) {
      handleEdgeCreation(node[entityPrimaryKeyProperty]);
    } else {
      toggleHighlightAttribute(node);
    }
  }, [allowSelecting, handleEdgeCreation, toggleHighlightAttribute]);

  const handleSelected = useCallback((...args) => {
    if (isDisabled(...args)) { return; }

    onSelected(...args);
  }, [isDisabled, onSelected]);

  return (
    <>
      {nodes.map((node, index) => {
        const el = layoutNodeElements[index];
        if (!el) { return null; }
        return (
          <LayoutNode
            node={node}
            portal={el}
            index={index}
            key={`${node[entityPrimaryKeyProperty]}_${index}`}
            onDragStart={handleDrag}
            onDragMove={handleDrag}
            onDragEnd={handleDragEnd}
            allowPositioning={allowPositioning}
            allowSelecting={allowSelecting}
            onSelect={handleSelected}
            selected={isHighlighted(node)}
            linking={isLinking(node)}
            inactive={isDisabled(node)}
          />
        );
      })}
    </>
  );
};

NodeLayout.propTypes = {
};

NodeLayout.defaultProps = {
  allowPositioning: true,
  allowSelecting: true,
};

export default NodeLayout;

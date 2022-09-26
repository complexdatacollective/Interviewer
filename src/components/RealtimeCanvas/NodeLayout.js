/* eslint-disable no-param-reassign */
import React, {
  useCallback, useContext, useEffect, useRef, useState,
} from 'react';
import { useDispatch } from 'react-redux';
import { entityPrimaryKeyProperty, entityAttributesProperty } from '@codaco/shared-consts';
import { isEmpty, get, find } from 'lodash';
import { actionCreators as sessionsActions } from '../../ducks/modules/sessions';
import LayoutContext from '../../contexts/LayoutContext';
import LayoutNode from './LayoutNode';

const NodeLayout = (props) => {
  const {
    highlightAttribute,
    destinationRestriction,
    originRestriction,
    createEdge,
  } = props;

  const {
    network: {
      nodes,
    },
    allowPositioning,
    allowSelect,
    simulation,
    getPosition,
    screen,
  } = useContext(LayoutContext);

  const dispatch = useDispatch();
  const toggleEdge = useCallback(
    (modelData, attributeData) => dispatch(sessionsActions.toggleEdge(modelData, attributeData)),
    [createEdge, dispatch],
  );

  const toggleHighlight = useCallback(
    (nodeUID, attributeData) => dispatch(
      sessionsActions.toggleNodeAttributes(
        nodeUID,
        attributeData,
      ),
    ), [dispatch, highlightAttribute],
  );

  const ref = useRef(null);
  const updateRAF = useRef(null);
  const [layoutEls, setLayoutEls] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [connectFrom, setConnectFrom] = useState(null);

  const createLayoutEls = useCallback(() => {
    const newEls = nodes.map((_, index) => {
      if (layoutEls[index]) { return layoutEls[index]; }

      const nodeEl = document.createElement('div');
      nodeEl.style.position = 'absolute';
      nodeEl.style.transform = 'translate(-50%, -50%)';
      nodeEl.style.display = 'none';
      ref.current.append(nodeEl);

      return nodeEl;
    });

    setLayoutEls(newEls);
  }, [nodes, ref]);

  const update = useCallback(() => {
    layoutEls.forEach((el, index) => {
      const relativePosition = getPosition(index);
      if (!relativePosition || !el) { return; }

      const screenPosition = screen.current.calculateScreenCoords(relativePosition);
      el.style.left = `${screenPosition.x}px`;
      el.style.top = `${screenPosition.y}px`;
      el.style.display = 'block';
    });

    updateRAF.current = requestAnimationFrame(() => update());
  }, [layoutEls, screen, getPosition]);

  useEffect(() => {
    if (layoutEls.length !== nodes.length) {
      createLayoutEls();
    }
  }, [nodes, layoutEls, createLayoutEls]);

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

  useEffect(() => {
    updateRAF.current = requestAnimationFrame(() => update());

    return () => {
      screen.current.destroy();
      cancelAnimationFrame(updateRAF.current);
    };
  }, [update]);

  const connectNode = useCallback((nodeId) => {
    // If edge creation is disabled, return
    if (!createEdge) { return; }

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
      toggleEdge({
        from: connectFrom,
        to: nodeId,
        type: createEdge,
      });
    }

    // Reset the node linking state
    setConnectFrom(null);
  }, [connectFrom, originRestriction, createEdge, nodes]);

  const handleDrag = useCallback((uuid, index, delta) => {
    setIsDragging(true);
    const relativeDelta = screen.current.calculateRelativeCoords(delta);

    const { moveNode } = simulation;
    moveNode(relativeDelta, index);
  }, [screen, simulation.moveNode]);

  const handleDragEnd = useCallback((uuid, index) => {
    const { simulationEnabled, updateNode } = simulation;
    if (!simulationEnabled) { return; }

    // Setting fx/fy to null will allow the node to be moved by the simulation
    updateNode({ fx: null, fy: null }, index);
  }, [simulation.simulationEnabled, simulation.updateNode]);

  const toggleHighlightAttribute = useCallback((node) => {
    if (!allowSelect) { return; }
    const newVal = !node[entityAttributesProperty][highlightAttribute];
    toggleHighlight(
      node[entityPrimaryKeyProperty],
      { [highlightAttribute]: newVal },
    );
  }, [allowSelect, highlightAttribute]);

  const onSelected = useCallback((node) => {
    if (!allowSelect) {
      connectNode(node[entityPrimaryKeyProperty]);
    } else {
      toggleHighlightAttribute(node);
    }
  }, [allowSelect, connectNode, toggleHighlightAttribute]);

  // When node is dragged this is called last,
  // we can use that to reset isDragging state
  const handleSelected = useCallback((...args) => {
    if (isDisabled(...args)) { return; }

    if (isDragging) {
      setIsDragging(false);
      return;
    }
    onSelected(...args);
  }, [isDragging, isDisabled, onSelected]);

  const initializeLayout = (el) => {
    if (!el || ref.current) { return; }
    ref.current = el;
    screen.current.initialize(el);
  };

  return (
    <>
      <div className="node-layout" ref={initializeLayout} />
      {nodes.map((node, index) => {
        const el = layoutEls[index];
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
            allowSelect={allowSelect}
            onSelected={handleSelected}
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
  allowSelect: true,
};

export default NodeLayout;

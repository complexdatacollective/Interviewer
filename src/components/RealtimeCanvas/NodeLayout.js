import React, {
  useRef,
  useEffect,
  useContext,
  useCallback,
} from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { isEmpty, get } from 'lodash';
import { actionCreators as sessionsActions } from '../../ducks/modules/sessions';
import LayoutContext from '../../contexts/LayoutContext';
import { entityPrimaryKeyProperty, entityAttributesProperty } from '../../ducks/modules/network';
import useScreen from './useScreen';
import LayoutNode from './LayoutNode';

// const relativeCoords = (container, node) => ({
//   x: (node.x - container.x) / container.width,
//   y: (node.y - container.y) / container.height,
// });

// updateNode(
//   item.meta[entityPrimaryKeyProperty],
//   {},
//   {
//     [layoutVariable]: relativeCoords({
//       width, height, x, y,
//     }, item),
//   },
// );

const NodeLayout = React.forwardRef(({
  allowPositioning,
  highlightAttribute,
  connectFrom,
  allowSelect,
  onSelected,
  // layoutVariable,
  // width,
  // height,
}, sendRef) => {
  const {
    network: { nodes, layout },
    viewport,
    simulation: {
      simulation,
      refresh,
      moveNode,
      isRunning,
      releaseNode,
      getPosition,
      simulationEnabled,
      toggleSimulation,
    },
  } = useContext(LayoutContext);

  const screen = useScreen();
  const ref = useRef();
  const timer = useRef();
  const layoutEls = useRef([]);

  const dispatch = useDispatch();

  useEffect(() => {
    if (isRunning || !simulation.current) { return; }

    nodes.forEach((node, index) => {
      const position = getPosition.current(index); // simulation.current.nodes[index];
      // if node is not in the simulation let, do not try to update in in the session
      if (!position) { return; }

      dispatch(sessionsActions.updateNode(
        node[entityPrimaryKeyProperty],
        undefined,
        { [layout]: position },
      ));
    });
    //
  }, [layout, isRunning]);

  const handleDragStart = useCallback((uuid, index, { dy, dx }) => {
    // moveNode({ dy, dx }, index);
  }, [simulationEnabled]);

  const handleDragMove = useCallback((uuid, index, { dy, dx, x, y }) => {
    if (simulationEnabled) {
      moveNode({ dy, dx }, index);
      return;
    }

    dispatch(sessionsActions.updateNode(
      uuid,
      undefined,
      { [layout]: screen.calculateRelativeCoords({ x, y }) },
    ));
  }, [layout, simulationEnabled, screen.calculateRelativeCoords]);

  const handleDragEnd = useCallback((uuid, index, { x, y }) => {
    if (simulationEnabled) {
      releaseNode(index);
      return;
    }

    dispatch(sessionsActions.updateNode(
      uuid,
      undefined,
      { [layout]: screen.calculateRelativeCoords({ x, y }) },
    ));
  }, [layout, simulationEnabled, screen.calculateRelativeCoords]);

  const update = useRef(() => {
    if (simulation.current.nodes) {
      simulation.current.nodes.forEach((_, index) => {
        const el = layoutEls.current[index];
        const relativePosition = getPosition.current(index);
        if (!relativePosition || !el) { return; }

        const screenPosition = screen.calculateScreenCoords(relativePosition);
        el.style.left = `${screenPosition.x}px`;
        el.style.top = `${screenPosition.y}px`;
      });
    }

    timer.current = requestAnimationFrame(() => update.current());
    // timer.current = setTimeout(() => update.current(), 10000);
  });

  useEffect(() => {
    if (!ref.current) { return; }

    layoutEls.current = nodes.map((_, index) => {
      if (layoutEls.current[index]) { return layoutEls.current[index]; }

      const nodeEl = document.createElement('div');
      nodeEl.style.position = 'absolute';
      nodeEl.style.transform = 'translate(-50%, -50%)';
      ref.current.append(nodeEl);

      return nodeEl;
    });
  }, [nodes]);

  useEffect(() => () => {
    if (!ref.current) { return; }
    layoutEls.current.forEach((el) => ref.current.removeChild(el));
  }, []);

  useEffect(() => {
    timer.current = requestAnimationFrame(() => update.current());

    return () => {
      cancelAnimationFrame(timer.current);
    };
  }, [nodes]);

  const initializeLayout = useCallback((el) => {
    if (!el) { return; }
    sendRef(el);
    ref.current = el;
    screen.initialize(el);
  }, []);

  const isHighlighted = useCallback(
    (node) => !isEmpty(highlightAttribute)
        && get(node, [entityAttributesProperty, highlightAttribute]) === true,
    [highlightAttribute],
  );

  const isLinking = useCallback(
    (node) => get(node, entityPrimaryKeyProperty) === connectFrom,
    [connectFrom],
  );

  return (
    <>
      <div className="node-layout" ref={initializeLayout}>
        {nodes.map((node, index) => {
          const el = layoutEls.current[index];
          if (!el) { return null; }
          return (
            <LayoutNode
              node={node}
              portal={el}
              index={index}
              key={index}
              onDragStart={handleDragStart}
              onDragMove={handleDragMove}
              onDragEnd={handleDragEnd}
              allowPositioning={allowPositioning}
              allowSelect={allowSelect}
              onSelected={onSelected}
              selected={isHighlighted(node)}
              linking={isLinking(node)}
            />
          );
        })}
      </div>
      <div style={{ position: 'absolute', top: 0, left: 0 }}>
        { !simulationEnabled && (
          <button type="button" onClick={() => toggleSimulation()}>enable simulation</button>
        )}
        { simulationEnabled && (
          <>
            <button type="button" onClick={() => toggleSimulation()}>disable simulation</button>
            <button type="button" onClick={() => refresh()}>start</button>
            <button type="button" onClick={() => viewport.zoomViewport(1.5)}>in</button>
            <button type="button" onClick={() => viewport.zoomViewport(0.67)}>out</button>
            <button type="button" onClick={() => viewport.moveViewport(-0.1, 0)}>left</button>
            <button type="button" onClick={() => viewport.moveViewport(0, 0.1)}>down</button>
            <button type="button" onClick={() => viewport.moveViewport(0, -0.1)}>up</button>
            <button type="button" onClick={() => viewport.moveViewport(0.1, 0)}>right</button>
          </>
        )}
      </div>
    </>
  );
});

NodeLayout.propTypes = {
  onSelected: PropTypes.func.isRequired,
  allowPositioning: PropTypes.bool,
  allowSelect: PropTypes.bool,
};

NodeLayout.defaultProps = {
  allowPositioning: true,
  allowSelect: true,
};

export { NodeLayout };

export default NodeLayout;

import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

import useForceSimulation from '../../hooks/useForceSimulation';
import useDrag from './useDrag';
import useViewport from './useViewport';
import LayoutNode from './LayoutNode';
// import getAbsoluteBoundingRect from '../../utils/getAbsoluteBoundingRect';

const LABEL = '0e75ec18-2cb1-4606-9f18-034d28b07c19';
const LAYOUT = 'd13ca72d-aefe-4f48-841d-09f020e0e988';

let frames = 100;

const NodeLayout = React.forwardRef(({
  nodes,
  allowPositioning,
  highlightAttribute,
  connectFrom,
  allowSelect,
  onSelected,
  layoutVariable,
  width,
  height,
}, oref) => {
  const ref = useRef();
  const layoutNodes = useRef([]);
  const [forceSimulation, isRunning, start, stop, updateNode] = useForceSimulation();
  const [getDelta, handleDragStart, handleDragMove, handleDragEnd] = useDrag();
  const [
    viewportState,
    moveViewport,
    zoomViewport,
    calculateLayoutCoords,
    calculateRelativeCoords,
    calculateScreenCoords,
    measureCanvas,
  ] = useViewport();

  const timer = useRef();

  const update = useRef(() => {
    if (forceSimulation.current.positions) {
      const delta = getDelta();
      forceSimulation.current.positions.forEach((position, index) => {
        if (index === delta.id && delta.hasMoved) {
          const newPosition = {
            y: position.y + (delta.dy / viewportState.current.zoom),
            x: position.x + (delta.dx / viewportState.current.zoom),
          };

          updateNode(newPosition, index);
        }

        const screenPosition = calculateScreenCoords(calculateRelativeCoords(position));

        // console.log(position, calcRel(position), calcScreen(calcRel(position)));

        layoutNodes.current[index].el.style.left = `${screenPosition.x}px`;
        layoutNodes.current[index].el.style.top = `${screenPosition.y}px`;
      });

      frames -= 1;
    }

    if (frames === 0) {
      forceSimulation.current.positions.forEach((position) => {
        console.log(
          position,
          calculateRelativeCoords(position),
          calculateScreenCoords(calculateRelativeCoords(position)),
        );
      });

      // return;
    }

    timer.current = requestAnimationFrame(() => update.current());
  });

  useEffect(() => {
    if (!ref.current) { return () => {}; }

    const container = document.createElement('div');
    container.className = 'nodes-layout';
    container.setAttribute('style', 'position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 200;');
    ref.current.appendChild(container);

    measureCanvas(container);

    layoutNodes.current = nodes.map((n) => {
      const a = n.attributes;

      return LayoutNode({
        color: 'color-neon-coral',
        label: a[LABEL],
        layout: a[LAYOUT],
      });
    });


    layoutNodes.current.forEach((n, index) => {
      container.appendChild(n.el);

      n.el.addEventListener('mousedown', (e) => handleDragStart(e, index));
    });

    window.addEventListener('mousemove', handleDragMove);
    window.addEventListener('mouseup', handleDragEnd);

    const simNodes = layoutNodes.current.map(({ layout }) => calculateLayoutCoords(layout));
    console.log(simNodes);
    start({ nodes: simNodes });

    timer.current = requestAnimationFrame(() => update.current());
    return () => cancelAnimationFrame(timer.current);
  }, []);

  return (
    <>
      <div className="node-layout" ref={ref} />
      <div style={{ position: 'absolute', top: 0, left: 0 }}>
        <button type="button" onClick={() => zoomViewport(1.5)}>in</button>
        <button type="button" onClick={() => zoomViewport(0.67)}>out</button>
        <button type="button" onClick={() => moveViewport(-0.1, 0)}>left</button>
        <button type="button" onClick={() => moveViewport(0, 0.1)}>down</button>
        <button type="button" onClick={() => moveViewport(0, -0.1)}>up</button>
        <button type="button" onClick={() => moveViewport(0.1, 0)}>right</button>
      </div>
      <div ref={oref} />
    </>
  );
});

NodeLayout.propTypes = {
  nodes: PropTypes.array.isRequired,
  onSelected: PropTypes.func.isRequired,
  connectFrom: PropTypes.string,
  highlightAttribute: PropTypes.string,
  allowPositioning: PropTypes.bool.isRequired,
  allowSelect: PropTypes.bool,
  layoutVariable: PropTypes.string.isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
};

NodeLayout.defaultProps = {
  connectFrom: null,
  highlightAttribute: null,
  allowSelect: true,
};

export { NodeLayout };

export default NodeLayout;

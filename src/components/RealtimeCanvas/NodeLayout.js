import React, { useRef, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import LayoutContext from '../../contexts/LayoutContext';
import useDrag from './useDrag';
import LayoutNode from './LayoutNode';
// import getAbsoluteBoundingRect from '../../utils/getAbsoluteBoundingRect';

const LABEL = '0e75ec18-2cb1-4606-9f18-034d28b07c19';
const LAYOUT = 'd13ca72d-aefe-4f48-841d-09f020e0e988';

const NodeLayout = React.forwardRef(({
  nodes,
  // allowPositioning,
  // highlightAttribute,
  // connectFrom,
  // allowSelect,
  // onSelected,
  // layoutVariable,
  // width,
  // height,
}, oref) => {
  const ref = useRef();
  const layoutNodes = useRef([]);
  const { forceSimulation, viewport, state } = useContext(LayoutContext);
  const [getDelta, handleDragStart, handleDragMove, handleDragEnd] = useDrag();

  const timer = useRef();

  const update = useRef(() => {
    const {
      hasMoved,
      id,
      dy,
      dx,
    } = getDelta();

    if (id && hasMoved) {
      forceSimulation.updateNodeByDelta({ dy, dx }, id);
    }

    if (forceSimulation.simulation.current.nodes) {
      forceSimulation.simulation.current.nodes.forEach((position, index) => {
        const screenPosition = viewport.calculateScreenCoords(
          viewport.calculateRelativeCoords(position),
        );

        layoutNodes.current[index].el.style.left = `${screenPosition.x}px`;
        layoutNodes.current[index].el.style.top = `${screenPosition.y}px`;
      });
    }

    timer.current = requestAnimationFrame(() => update.current());
  });

  useEffect(() => {
    if (!ref.current) { return () => {}; }

    const container = document.createElement('div');
    container.className = 'nodes-layout';
    container.setAttribute('style', 'position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 200;');
    ref.current.appendChild(container);

    viewport.measureCanvas(container);

    layoutNodes.current = nodes.map((n) => {
      const a = n.attributes;

      return LayoutNode({
        color: 'color-neon-coral',
        label: a[LABEL],
      });
    });

    layoutNodes.current.forEach((n, index) => {
      container.appendChild(n.el);

      n.el.addEventListener('mousedown', (e) => handleDragStart(e, index));
    });

    window.addEventListener('mousemove', handleDragMove);
    window.addEventListener('mouseup', handleDragEnd);

    timer.current = requestAnimationFrame(() => update.current());
    return () => cancelAnimationFrame(timer.current);
  }, [viewport.measureCanvas, forceSimulation.start, viewport.calculateLayoutCoords]);

  return (
    <>
      <div className="node-layout" ref={ref} />
      <div style={{ position: 'absolute', top: 0, left: 0 }}>
        <button type="button" onClick={() => viewport.zoomViewport(1.5)}>in</button>
        <button type="button" onClick={() => viewport.zoomViewport(0.67)}>out</button>
        <button type="button" onClick={() => viewport.moveViewport(-0.1, 0)}>left</button>
        <button type="button" onClick={() => viewport.moveViewport(0, 0.1)}>down</button>
        <button type="button" onClick={() => viewport.moveViewport(0, -0.1)}>up</button>
        <button type="button" onClick={() => viewport.moveViewport(0.1, 0)}>right</button>
      </div>
      <div ref={oref} />
    </>
  );
});

NodeLayout.propTypes = {
  nodes: PropTypes.array.isRequired,
  onSelected: PropTypes.func.isRequired,
  allowPositioning: PropTypes.bool.isRequired,
  allowSelect: PropTypes.bool,
};

NodeLayout.defaultProps = {
  allowPositioning: true,
  allowSelect: true,
};

export { NodeLayout };

export default NodeLayout;

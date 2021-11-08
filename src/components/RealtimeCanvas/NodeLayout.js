import React, { useRef, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import LayoutContext from '../../contexts/LayoutContext';
import useDrag from './useDrag';
import LayoutNode from './LayoutNode';

const LABEL = '0e75ec18-2cb1-4606-9f18-034d28b07c19';

const NodeLayout = React.forwardRef(({
  // allowPositioning,
  // highlightAttribute,
  // connectFrom,
  // allowSelect,
  onSelected,
  // layoutVariable,
  // width,
  // height,
}, oref) => {
  const ref = useRef();
  const layoutNodes = useRef([]);
  const {
    network: { nodes },
    viewport,
    simulation: { simulation, moveNode, releaseNode },
  } = useContext(LayoutContext);
  const drag = useDrag();

  const handleClick = (e, index) => {
    onSelected(nodes[index]);
  };

  const handleDragEnd = (e) => {
    if (drag.state.current.id) {
      releaseNode(drag.state.current.id);
    }
    drag.handleDragEnd(e);
  };

  const timer = useRef();

  const update = useRef(() => {
    const {
      hasMoved,
      id,
      dy,
      dx,
    } = drag.getDelta();

    if (id && hasMoved) {
      moveNode({ dy, dx }, id);
    }

    if (simulation.current.nodes) {
      simulation.current.nodes.forEach((position, index) => {
        const screenPosition = viewport.calculateViewportScreenCoords(
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
    container.setAttribute('id', 'nodes_layout');
    container.setAttribute('style', 'position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 200;');

    ref.current.appendChild(container);

    viewport.initializeViewport(container);

    return () => {
      ref.current.removeChild(container);
    };
  }, []);

  useEffect(() => {
    if (!ref.current) { return () => clearTimeout(timer.current); }

    const container = document.getElementById('nodes_layout');

    layoutNodes.current = nodes.map((n) => {
      const a = n.attributes;

      return LayoutNode({
        color: 'color-neon-coral',
        label: a[LABEL],
      });
    });

    const els = layoutNodes.current.map(({ el }) => el);

    els.forEach((el, index) => {
      container.appendChild(el);

      el.addEventListener('mousedown', (e) => {
        drag.handleDragStart(e, index);
        e.stopPropagation();
      });
      el.addEventListener('click', (e) => handleClick(e, index));
    });

    window.addEventListener('mousemove', drag.handleDragMove);
    window.addEventListener('mouseup', handleDragEnd);

    timer.current = requestAnimationFrame(() => update.current());

    return () => {
      els.forEach((el) => container.removeChild(el));

      window.removeEventListener('mousemove', drag.handleDragMove);
      window.removeEventListener('mouseup', handleDragEnd);

      cancelAnimationFrame(timer.current);
    };
  }, [nodes]);

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

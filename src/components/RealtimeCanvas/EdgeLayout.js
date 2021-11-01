import React from 'react';
import PropTypes from 'prop-types';
import Edge from '../Edge';

const viewBoxScale = 100;

const EdgeLayout = () => {
  const lines = useRef();
  const svg = useRef();
  const { forceSimulation, viewport, edges } = useContext(LayoutContext);
  const timer = useRef();

  const update = useRef(() => {
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
    if (!svg.current) { return () => {}; }

    lines.current = edges.map(() => {
      const svgNS = svg.current.namespaceURI;
      const line = document.createElementNS(svgNS, 'line');
      line.setAttributeNS(null, 'x1', from.x * viewBoxScale);
      line.setAttributeNS(null, 'y1', from.y * viewBoxScale);
      line.setAttributeNS(null, 'x2', to.x * viewBoxScale);
      line.setAttributeNS(null, 'y2', to.y * viewBoxScale);
      line.setAttributeNS(null, 'stroke', `var(--${color})`);
    });

    lines.current.map(svg.appendChild);
  }, []);

    return (
      <div className="edge-layout">
        <svg
          viewBox={`0 0 ${viewBoxScale} ${viewBoxScale}`}
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          ref={svg}
        />
      </div>
    );
  }
}

EdgeLayout.propTypes = {
  edges: PropTypes.array,
};

EdgeLayout.defaultProps = {
  edges: [],
};

export { EdgeLayout };

export default EdgeLayout;

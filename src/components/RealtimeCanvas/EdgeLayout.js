import React, { useRef, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import { thru } from 'lodash';
import LayoutContext from '../../contexts/LayoutContext';
import Edge from '../Edge';

const viewBoxScale = 100;

const EdgeLayout = () => {
  const lines = useRef();
  const svg = useRef();
  const { forceSimulation, viewport, edges } = useContext(LayoutContext);
  const timer = useRef();

  const update = useRef(() => {
    // debugger;
    if (forceSimulation.simulation.current.links) {
      forceSimulation.simulation.current.links.forEach((link, index) => {
        const from = forceSimulation.simulation.current.nodes[link.source];
        const to = forceSimulation.simulation.current.nodes[link.target];

        const fromNodeScreenPosition = viewport.calculateViewportRelativeCoords(
          viewport.calculateRelativeCoords(from),
        );

        const toNodeScreenPosition = viewport.calculateViewportRelativeCoords(
          viewport.calculateRelativeCoords(to),
        );

        lines.current[index].el.setAttributeNS(null, 'x1', fromNodeScreenPosition.x * 100);
        lines.current[index].el.setAttributeNS(null, 'y1', fromNodeScreenPosition.y * 100);
        lines.current[index].el.setAttributeNS(null, 'x2', toNodeScreenPosition.x * 100);
        lines.current[index].el.setAttributeNS(null, 'y2', toNodeScreenPosition.y * 100);
      });
    }

    timer.current = requestAnimationFrame(() => update.current());
  });

  useEffect(() => {
    if (!svg.current) { return () => cancelAnimationFrame(timer.current); }

    // debugger;

    lines.current = edges.map((edge) => {
      // console.log({ edge });
      const svgNS = svg.current.namespaceURI;
      const line = document.createElementNS(svgNS, 'line');
      // line.setAttributeNS(null, 'x1', from.x * viewBoxScale);
      // line.setAttributeNS(null, 'y1', from.y * viewBoxScale);
      // line.setAttributeNS(null, 'x2', to.x * viewBoxScale);
      // line.setAttributeNS(null, 'y2', to.y * viewBoxScale);
      // line.setAttributeNS(null, 'stroke', `var(--${color})`);
      line.setAttributeNS(null, 'stroke', 'red');
      return { ...edge, el: line };
    });

    const els = lines.current.map(({ el }) => el);

    els.forEach((el) => svg.current.appendChild(el));

    timer.current = requestAnimationFrame(() => update.current());

    return () => {
      // debugger;
      els.forEach((el) => svg.current.removeChild(el));
      cancelAnimationFrame(timer.current);
    };
  }, [edges]);

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
};

EdgeLayout.propTypes = {
  edges: PropTypes.array,
};

EdgeLayout.defaultProps = {
  edges: [],
};

export { EdgeLayout };

export default EdgeLayout;

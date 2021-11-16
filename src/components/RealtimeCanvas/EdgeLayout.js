import React, { useRef, useContext, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { get } from 'lodash';
import LayoutContext from '../../contexts/LayoutContext';
import { getProtocolCodebook } from '../../selectors/protocol';

const viewBoxScale = 100;

const EdgeLayout = () => {
  const lines = useRef();
  const svg = useRef();
  const { network: { edges }, simulation: { simulation } } = useContext(LayoutContext);
  const timer = useRef();
  const edgeDefinitions = useSelector((state) => getProtocolCodebook(state).edge);

  const update = useRef(() => {
    // debugger;
    if (simulation.current.links) {
      simulation.current.links.forEach((link, index) => {
        const from = simulation.current.nodes[link.source];
        const to = simulation.current.nodes[link.target];

        lines.current[index].el.setAttributeNS(null, 'x1', from.x * 100);
        lines.current[index].el.setAttributeNS(null, 'y1', from.y * 100);
        lines.current[index].el.setAttributeNS(null, 'x2', to.x * 100);
        lines.current[index].el.setAttributeNS(null, 'y2', to.y * 100);
      });
    }

    timer.current = requestAnimationFrame(() => update.current());
  });

  useEffect(() => {
    if (!svg.current) { return () => cancelAnimationFrame(timer.current); }

    // debugger;

    lines.current = edges.map((edge) => {
      const svgNS = svg.current.namespaceURI;
      const line = document.createElementNS(svgNS, 'line');
      const color = get(edgeDefinitions, [edge.type, 'color'], 'edge-color-seq-1');
      // line.setAttributeNS(null, 'x1', from.x * viewBoxScale);
      // line.setAttributeNS(null, 'y1', from.y * viewBoxScale);
      // line.setAttributeNS(null, 'x2', to.x * viewBoxScale);
      // line.setAttributeNS(null, 'y2', to.y * viewBoxScale);
      line.setAttributeNS(null, 'stroke', `var(--${color})`);
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
  }, [edges, edgeDefinitions]);

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

export { EdgeLayout };

export default EdgeLayout;

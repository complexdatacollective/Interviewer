import React, { useRef, useContext, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { get } from 'lodash';
import LayoutContext from '../../contexts/LayoutContext';
import { getProtocolCodebook } from '../../selectors/protocol';

const viewBoxScale = 100;

const EdgeLayout = () => {
  const lines = useRef();
  const svg = useRef();
  const {
    network: { edges, links },
    simulation: { getPosition },
  } = useContext(LayoutContext);
  const timer = useRef();
  const edgeDefinitions = useSelector((state) => getProtocolCodebook(state).edge);

  const update = useRef(() => {
    // debugger;
    lines.current.forEach((line) => {
      if (!line.link) { return; }

      const from = getPosition.current(line.link.source);
      const to = getPosition.current(line.link.target);

      line.el.setAttributeNS(null, 'x1', from.x * 100);
      line.el.setAttributeNS(null, 'y1', from.y * 100);
      line.el.setAttributeNS(null, 'x2', to.x * 100);
      line.el.setAttributeNS(null, 'y2', to.y * 100);
    });

    timer.current = requestAnimationFrame(() => update.current());
  });

  useEffect(() => {
    if (!svg.current) { return () => cancelAnimationFrame(timer.current); }

    // debugger;

    lines.current = edges.map((edge, index) => {
      const svgNS = svg.current.namespaceURI;
      const line = document.createElementNS(svgNS, 'line');
      const color = get(edgeDefinitions, [edge.type, 'color'], 'edge-color-seq-1');
      line.setAttributeNS(null, 'stroke', `var(--${color})`);
      return { ...edge, el: line, link: links[index] };
    });

    const els = lines.current.map(({ el }) => el);

    els.forEach((el) => svg.current.appendChild(el));

    timer.current = requestAnimationFrame(() => update.current());

    return () => {
      // debugger;
      els.forEach((el) => svg.current.removeChild(el));
      cancelAnimationFrame(timer.current);
    };
  }, [edges, links, edgeDefinitions]);

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

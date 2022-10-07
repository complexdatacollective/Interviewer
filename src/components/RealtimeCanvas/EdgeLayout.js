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
    edges,
    getLayoutNodePosition,
  } = useContext(LayoutContext);
  const timer = useRef();
  const edgeDefinitions = useSelector((state) => getProtocolCodebook(state).edge);

  const update = useRef(() => {
    lines.current.forEach(({ link, el }) => {
      if (!link) { return; }

      const from = getLayoutNodePosition(link.source);
      const to = getLayoutNodePosition(link.target);

      if (!from || !to) { return; }

      el.setAttributeNS(null, 'x1', from.x * 100);
      el.setAttributeNS(null, 'y1', from.y * 100);
      el.setAttributeNS(null, 'x2', to.x * 100);
      el.setAttributeNS(null, 'y2', to.y * 100);
    });

    timer.current = requestAnimationFrame(() => update.current());
  });

  useEffect(() => {
    if (!svg.current) { return () => cancelAnimationFrame(timer.current); }

    lines.current = edges.map((edge, index) => {
      const svgNS = svg.current.namespaceURI;
      const el = document.createElementNS(svgNS, 'line');
      const color = get(edgeDefinitions, [edge.type, 'color'], 'edge-color-seq-1');
      el.setAttributeNS(null, 'stroke', `var(--${color})`);
      return { edge, el, link: edges[index] };
    });

    lines.current.forEach(({ el }) => svg.current.appendChild(el));

    timer.current = requestAnimationFrame(() => update.current());

    return () => {
      lines.current.forEach(({ el }) => svg.current.removeChild(el));
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

export default EdgeLayout;

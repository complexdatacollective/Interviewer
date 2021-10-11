import React, { useCallback, useState, useRef, useEffect } from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';
import { isEmpty, get } from 'lodash';
import LayoutNode from '../../containers/Canvas/LayoutNode';
import { entityPrimaryKeyProperty, entityAttributesProperty } from '../../ducks/modules/network';

const Node = ({
  label,
  color,
  inactive,
  selected,
  selectedColor,
  linking,
  handleClick,
  layout,
}) => {
  const classes = cx(
    'node',
    {
      'node--inactive': inactive,
      'node--selected': selected,
      'node--linking': linking,
      [`node--${selectedColor}`]: selected && selectedColor,
    },
  );

  const labelClasses = () => {
    const labelLength = label.length;
    return `node__label-text len-${labelLength}`;
  };

  const nodeBaseColor = `var(--${color})`;
  const nodeFlashColor = `var(--${color}--dark)`;

  const labelWithEllipsis = label.length < 22 ? label : `${label.substring(0, 18)}\u{AD}...`; // Add ellipsis for really long labels

  // <div className={classes} onClick={handleClick}>
  //   <svg
  //     viewBox="0 0 500 500"
  //     xmlns="http://www.w3.org/2000/svg"
  //     className="node__node"
  //     preserveAspectRatio="xMidYMid meet"
  //   >
  //     <circle cx="250" cy="270" r="200" className="node__node-shadow" opacity="0.25" />
  //     <circle cx="250" cy="250" r="250" className="node__node-outer-trim" />
  //     <circle cx="250" cy="250" r="200" fill={nodeBaseColor} className="node__node-base" />
  //     <path
  //       d="m50,250 a1,1 0 0,0 400,0"
  //       fill={nodeFlashColor}
  //       className="node__node-flash"
  //       transform="rotate(-35 250 250)"
  //     />
  //     <circle cx="250" cy="250" r="200" className="node__node-trim" />
  //   </svg>
  //   <div className="node__label">
  //     <div
  //       className={labelClasses()}
  //       ref={(labelText) => { this.labelText = labelText; }}
  //     >
  //       {labelWithEllipsis}
  //     </div>
  //   </div>
  // </div>

  const container = document.createElement('div');
  container.className = classes;
  container.onClick = handleClick;
  // container.setAttribute('style', 'width: 1em; height: 1em;');

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  const svgNS = svg.namespaceURI;
  svg.setAttributeNS(null, 'class', 'node__node');
  svg.setAttributeNS(null, 'viewBox', '0 0 500 500');
  svg.setAttributeNS(null, 'preserveAspectRatio', 'xMidYMid meet');

  const shadow = document.createElementNS(svgNS, 'circle');
  shadow.setAttributeNS(null, 'class', 'node__node-shadow');
  shadow.setAttributeNS(null, 'cx', '250');
  shadow.setAttributeNS(null, 'cy', '270');
  shadow.setAttributeNS(null, 'r', '200');
  shadow.setAttributeNS(null, 'opacity', '0.25');

  const outer = document.createElementNS(svgNS, 'circle');
  outer.setAttributeNS(null, 'class', 'node__node-outer-trim');
  outer.setAttributeNS(null, 'cx', '250');
  outer.setAttributeNS(null, 'cy', '250');
  outer.setAttributeNS(null, 'r', '250');

  const base = document.createElementNS(svgNS, 'circle');
  base.setAttributeNS(null, 'class', 'node__node-base');
  base.setAttributeNS(null, 'cx', '250');
  base.setAttributeNS(null, 'cy', '250');
  base.setAttributeNS(null, 'r', '200');
  base.setAttributeNS(null, 'fill', nodeBaseColor);

  const flash = document.createElementNS(svgNS, 'path');
  flash.setAttributeNS(null, 'class', 'node__node-flash');
  flash.setAttributeNS(null, 'd', 'm50,250 a1,1 0 0,0 400,0');
  flash.setAttributeNS(null, 'fill', nodeFlashColor);
  flash.setAttributeNS(null, 'transform', 'rotate(-35 250 250)');

  const trim = document.createElementNS(svgNS, 'circle');
  trim.setAttributeNS(null, 'class', 'node__node-trim');
  trim.setAttributeNS(null, 'cx', '250');
  trim.setAttributeNS(null, 'cy', '250');
  trim.setAttributeNS(null, 'r', '200');

  const labelEl = document.createElement('div');
  labelEl.className = 'node__label';

  const labelText = document.createElement('div');
  labelText.className = labelClasses();
  const text = document.createTextNode(labelWithEllipsis);
  labelText.appendChild(text);

  svg.appendChild(shadow);
  svg.appendChild(outer);
  svg.appendChild(base);
  svg.appendChild(flash);
  svg.appendChild(trim);
  container.appendChild(svg);
  labelEl.appendChild(labelText);
  container.appendChild(labelEl);

  return { el: container, layout: { ...layout } };
};

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
}, ref) => {
  const isHighlighted = useCallback(
    (node) => !isEmpty(highlightAttribute)
        && get(node, [entityAttributesProperty, highlightAttribute]) === true,
    [highlightAttribute],
  );

  const isLinking = useCallback(
    (node) => get(node, entityPrimaryKeyProperty) === connectFrom,
    [connectFrom],
  );

  const [state, setState] = useState(nodes);

  const timer = useRef();
  const domNodes = useRef([]);

  const update = useRef(() => {
    domNodes.current = domNodes.current.map((n) => {
      const { layout } = n;

      const newN = {
        ...n,
        layout: {
          x: layout.x + (Math.random() * 0.001 - 0.0005),
          y: layout.y + (Math.random() * 0.001 - 0.0005),
        },
      };

      newN.el.style = `left: ${100 * layout.x}%; top: ${100 * layout.y}%; transform: 'translate(-50%, -50%)';`;

      return newN;
    });

    timer.current = requestAnimationFrame(() => update.current());
  });

  useEffect(() => {
    domNodes.current = nodes.map((n) => {
      const a = n.attributes;

      return Node({
        color: 'color-neon-coral',
        label: a['c7053a78-bcd5-44bb-bfca-36c8aefa793f'],
        layout: a['88271ba2-301d-402c-8407-cfa89446ca1d'],
      });
    });

    const container = document.createElement('div');
    container.className = 'nodes-layout';
    container.setAttribute('style', 'position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 200;');
    domNodes.current.forEach((n) => {
      container.appendChild(n.el);
    });

    document.body.appendChild(container);

    // update.current();

    timer.current = requestAnimationFrame(() => update.current());
    return () => cancelAnimationFrame(timer.current);
  }, []);

  return (
    <div className="node-layout" ref={ref}>
      { state.map((node) => (
        <LayoutNode
          key={node[entityPrimaryKeyProperty]}
          node={node}
          layoutVariable={layoutVariable}
          onSelected={() => onSelected(node)}
          selected={isHighlighted(node)}
          linking={isLinking(node)}
          allowPositioning={allowPositioning}
          allowSelect={allowSelect}
          areaWidth={width}
          areaHeight={height}
        />
      ))}
    </div>
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

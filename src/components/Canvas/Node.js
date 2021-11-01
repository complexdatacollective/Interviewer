import cx from 'classnames';

const Node = ({
  label = '',
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
  container.style.position = 'absolute';
  container.style.transform = 'translate(-50%, -50%)';
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

export default Node;

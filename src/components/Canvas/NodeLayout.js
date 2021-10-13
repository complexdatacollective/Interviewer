import React, { useCallback, useState, useRef, useEffect } from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';
import { isEmpty, get } from 'lodash';
import LayoutNode from '../../containers/Canvas/LayoutNode';
import useForceSimulation from '../../hooks/useForceSimulation';
import { entityPrimaryKeyProperty, entityAttributesProperty } from '../../ducks/modules/network';
import getAbsoluteBoundingRect from '../../utils/getAbsoluteBoundingRect';

const LABEL = '0e75ec18-2cb1-4606-9f18-034d28b07c19';
const LAYOUT = 'd13ca72d-aefe-4f48-841d-09f020e0e988';

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

function isTouch(event) {
  if (typeof TouchEvent !== 'undefined' && event instanceof TouchEvent) {
    return true;
  }
  return false;
}

function getCoords(event) {
  if (isTouch(event)) {
    const touch = event.changedTouches.item(0);
    return {
      x: touch.clientX,
      y: touch.clientY,
    };
  }

  return {
    x: event.clientX,
    y: event.clientY,
  };
}

function moveDelta(start, end) {
  return {
    dy: end.y - start.y,
    dx: end.x - start.x,
  };
}

let lastPosition;
let hasMoved;
let move;
let elIndex;
let zoom = 1;
let center = { x: 0.5, y: 0.5 };
let screen;

const zoomIn = () => {
  zoom *= 1.5;
};

const zoomOut = () => {
  zoom *= 0.67;
};

const moveLeft = () => { center = { ...center, x: center.x - (0.1 / zoom) }; };
const moveDown = () => { center = { ...center, y: center.y + (0.1 / zoom) }; };
const moveUp = () => { center = { ...center, y: center.y - (0.1 / zoom) }; };
const moveRight = () => { center = { ...center, x: center.x + (0.1 / zoom) }; };

// -1000 - -1000 space, 0,0 center
const calcGrid = ({ x, y }) => ({
  x: (x - 0.5) * 2000,
  y: (y - 0.5) * 2000,
});

// -1000 - -1000 space, 0,0 center
const calcRel = ({ x, y }) => ({
  x: (x / 2000) + 0.5,
  y: (y / 2000) + 0.5,
});

// takes a relative position
const calcScreen = ({ x, y }) => ({
  x: ((x - center.x) * screen.width * zoom) + (0.5 * screen.width),
  y: ((y - center.y) * screen.height * zoom) + (0.5 * screen.height),
});

const getMove = (e) => {
  const { x, y } = getCoords(e);
  const { dy, dx } = moveDelta(lastPosition, { x, y });

  return {
    x,
    y,
    dy,
    dx,
  };
};

const handleDragStart = (e, index) => {
  elIndex = index;
  lastPosition = getCoords(e);
  console.log('start');
};

const handleDragMove = (e) => {
  if (!elIndex) { return; }
  move = getMove(e);
  hasMoved = true;
  console.log('move');
};

const handleDragEnd = (e) => {
  if (!elIndex) { return; }
  elIndex = null;
  // hasMoved = false;
  // move = null;
  // move = getMove(e);
  console.log('end', getMove(e));
};

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
  const [state, isRunning, start, stop, updateNode] = useForceSimulation();

  const timer = useRef();

  const update = useRef(() => {
    if (state.current.positions) {
      state.current.positions.forEach((position, index) => {
        if (index === elIndex && hasMoved) {
          const newPosition = {
            y: position.y + (move.dy / zoom),
            x: position.x + (move.dx / zoom),
          };

          lastPosition = { x: move.x, y: move.y };

          updateNode(newPosition, index);

          // console.log('update', zoom, newPosition, lastPosition, index);
          hasMoved = false;
        }

        const screenPosition = calcScreen(calcRel(position));

        // console.log(position, calcRel(position), calcScreen(calcRel(position)));

        layoutNodes.current[index].el.style.left = `${screenPosition.x}px`;
        layoutNodes.current[index].el.style.top = `${screenPosition.y}px`;
      });

      frames -= 1;
    }

    if (frames === 0) {
      state.current.positions.forEach((position) => {
        console.log(position, calcRel(position), calcScreen(calcRel(position)));
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

    screen = getAbsoluteBoundingRect(container);

    console.log(screen);

    layoutNodes.current = nodes.map((n) => {
      const a = n.attributes;

      return Node({
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

    const simNodes = layoutNodes.current.map(({ layout }) => calcGrid(layout));
    console.log(simNodes);
    start({ nodes: simNodes });

    timer.current = requestAnimationFrame(() => update.current());
    return () => cancelAnimationFrame(timer.current);
  }, []);

  return (
    <>
      <div className="node-layout" ref={ref} />
      <div style={{ position: 'absolute', top: 0, left: 0 }}>
        <button type="button" onClick={zoomIn}>in</button>
        <button type="button" onClick={zoomOut}>out</button>
        <button type="button" onClick={moveLeft}>left</button>
        <button type="button" onClick={moveDown}>down</button>
        <button type="button" onClick={moveUp}>up</button>
        <button type="button" onClick={moveRight}>right</button>
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

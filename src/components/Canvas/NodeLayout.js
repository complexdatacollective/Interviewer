import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { isEmpty, get } from 'lodash';
import Node from './Node';
import useForceSimulation from '../../hooks/useForceSimulation';
import { entityPrimaryKeyProperty, entityAttributesProperty } from '../../ducks/modules/network';
import getAbsoluteBoundingRect from '../../utils/getAbsoluteBoundingRect';

const LABEL = '0e75ec18-2cb1-4606-9f18-034d28b07c19';
const LAYOUT = 'd13ca72d-aefe-4f48-841d-09f020e0e988';

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

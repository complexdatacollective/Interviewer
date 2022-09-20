/* eslint-disable no-param-reassign */
import React, {
  useContext,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { entityAttributesProperty, entityPrimaryKeyProperty } from '@codaco/shared-consts';
import PropTypes from 'prop-types';
import {
  isEmpty,
  get,
  find,
  noop,
} from 'lodash';
import LayoutContext from '../../contexts/LayoutContext';
import LayoutNode from './LayoutNode';

const NodeLayout = React.forwardRef((props) => {
  const {
    layout,
    connectFrom,
    allowPositioning,
    highlightAttribute,
    allowSelect,
    updateNode,
    twoMode,
    destinationRestriction,
    originRestriction,
  } = props;

  const ref = useRef(null);
  const animationFrameRef = useRef(null);

  const {
    network: {
      nodes,
    },
    getPosition,
    allowAutomaticLayout,
    simulation,
    screen,
  } = useContext(LayoutContext);

  const [isDragging, setIsDragging] = useState(false);
  const [layoutEls, setLayoutEls] = useState([]);

  const createLayoutEls = () => {
    const els = nodes.map((_, index) => {
      if (layoutEls[index]) { return layoutEls[index]; }

      const nodeEl = document.createElement('div');
      nodeEl.style.position = 'absolute';
      nodeEl.style.transform = 'translate(-50%, -50%)';
      nodeEl.style.display = 'none';
      ref.current.append(nodeEl);

      return nodeEl;
    });

    setLayoutEls(els);
  };

  const update = () => {
    layoutEls.forEach((el, index) => {
      const relativePosition = getPosition.current(index);
      if (!relativePosition || !el) { return; }
      const screenPosition = screen.current.calculateScreenCoords(relativePosition);
      el.style.left = `${screenPosition.x}px`;
      el.style.top = `${screenPosition.y}px`;
      el.style.display = 'block';
    });

    animationFrameRef.current = requestAnimationFrame(() => update());
  };

  useEffect(() => {
    createLayoutEls();
  }, []);

  useEffect(() => {
    animationFrameRef.current = requestAnimationFrame(() => update());

    return () => {
      screen.current.destroy();
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [layoutEls]);

  useRef(() => {
    if (layoutEls.length !== nodes.length) {
      createLayoutEls();
    }
  }, [nodes, layoutEls, createLayoutEls]);

  const isHighlighted = useCallback(
    (node) => !isEmpty(highlightAttribute)
      && get(node, [entityAttributesProperty, highlightAttribute]) === true,
    [highlightAttribute],
  );

  const isLinking = useCallback(
    (node) => get(node, entityPrimaryKeyProperty) === connectFrom,
    [connectFrom],
  );

  const isDisabled = useCallback(
    (node) => {
      // Node is disabled if type is same as originRestriction
      if (originRestriction && node.type === originRestriction) { return true; }

      // Not disabled if we aren't linking, or if the node is the origin
      if (!connectFrom || connectFrom === node[entityPrimaryKeyProperty]) { return false; }

      const originType = find(nodes, [entityPrimaryKeyProperty, connectFrom]).type;
      const thisType = get(node, 'type');

      if (destinationRestriction === 'same') {
        return thisType !== originType;
      }

      if (destinationRestriction === 'different') {
        return thisType === originType;
      }

      return false;
    },
    [connectFrom, destinationRestriction, nodes],
  );

  const initializeLayout = (el) => {
    if (!el) { return; }
    ref.current = el;
    screen.current.initialize(el);
  };

  const handleDragStart = (uuid, index, delta) => {
    setIsDragging(true);

    const {
      x,
      y,
    } = delta;

    const relativeDelta = screen.current.calculateRelativeCoords(delta);

    if (allowAutomaticLayout) {
      const { simulationEnabled, moveNode } = simulation;
      if (simulationEnabled) {
        moveNode(relativeDelta, index);
        return;
      }
    }

    const layoutVariable = twoMode ? layout[get(nodes, [uuid, 'type'])] : layout;

    updateNode(
      uuid,
      undefined,
      { [layoutVariable]: screen.current.calculateRelativeCoords({ x, y }) },
    );
  };

  const handleDragMove = (uuid, index, delta) => {
    const {
      x,
      y,
    } = delta;

    const relativeDelta = screen.current.calculateRelativeCoords(delta);

    if (allowAutomaticLayout) {
      const { simulationEnabled, moveNode } = simulation;
      if (simulationEnabled) {
        moveNode(relativeDelta, index);
        return;
      }
    }

    const layoutVariable = twoMode ? layout[get(nodes, [uuid, 'type'])] : layout;

    updateNode(
      uuid,
      undefined,
      { [layoutVariable]: screen.current.calculateRelativeCoords({ x, y }) },
    );
  };

  const handleDragEnd = (uuid, index, { x, y }) => {
    if (allowAutomaticLayout) {
      const { simulationEnabled, releaseNode } = simulation;

      if (simulationEnabled) {
        releaseNode(index);
        return;
      }
    }

    const layoutVariable = twoMode ? layout[get(nodes, [uuid, 'type'])] : layout;

    updateNode(
      uuid,
      undefined,
      { [layoutVariable]: screen.current.calculateRelativeCoords({ x, y }) },
    );
  };

  // When node is dragged this is called last,
  // we can use that to reset isDragging state
  const handleSelected = (...args) => {
    const { onSelected } = props;
    if (isDragging) {
      setIsDragging(false);
      return;
    }
    onSelected(...args);
  };

  return (
    <>
      <div className="node-layout" ref={initializeLayout} />
      {nodes.map((node, index) => {
        const el = layoutEls[index];
        if (!el) { return null; }
        return (
          <LayoutNode
            node={node}
            portal={el}
            index={index}
            key={`${node[entityPrimaryKeyProperty]}_${index}`}
            onDragStart={handleDragStart}
            onDragMove={handleDragMove}
            onDragEnd={handleDragEnd}
            allowPositioning={allowPositioning}
            allowSelect={allowSelect}
            onSelected={(e) => {
              if (isDisabled(node)) { return noop; }
              return handleSelected(e);
            }}
            selected={isHighlighted(node)}
            linking={isLinking(node)}
            inactive={isDisabled(node)}
          />
        );
      })}
    </>
  );
});

NodeLayout.propTypes = {
  onSelected: PropTypes.func.isRequired,
  allowPositioning: PropTypes.bool,
  allowSelect: PropTypes.bool,
};

NodeLayout.defaultProps = {
  allowPositioning: true,
  allowSelect: true,
};

export { NodeLayout };

export default NodeLayout;

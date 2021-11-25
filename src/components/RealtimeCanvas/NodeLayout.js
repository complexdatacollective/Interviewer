/* eslint-disable no-param-reassign */
import React from 'react';
import PropTypes from 'prop-types';
import { isEmpty, get } from 'lodash';
import LayoutContext from '../../contexts/LayoutContext';
import { entityPrimaryKeyProperty, entityAttributesProperty } from '../../ducks/modules/network';
import ScreenManager from './ScreenManager';
import LayoutNode from './LayoutNode';

class NodeLayout extends React.Component {
  constructor(props) {
    super(props);

    this.ref = React.createRef();
    this.updateRAF = undefined;
    this.layoutEls = [];
    this.screen = ScreenManager();
  }

  componentDidMount() {
    this.createLayoutEls();
    this.updateRAF = requestAnimationFrame(() => this.update());
  }

  componentDidUpdate(prevProps) {
    const { nodes } = this.props;

    if (prevProps.nodes.length !== nodes.length) {
      this.createLayoutEls();
    }
  }

  componentWillUnmount() {
    cancelAnimationFrame(this.updateRAF);
  }

  createLayoutEls = () => {
    const { nodes } = this.props;

    this.layoutEls = nodes.map((_, index) => {
      if (this.layoutEls[index]) { return this.layoutEls[index]; }

      const nodeEl = document.createElement('div');
      nodeEl.style.position = 'absolute';
      nodeEl.style.transform = 'translate(-50%, -50%)';
      nodeEl.style.display = 'none';
      this.ref.current.append(nodeEl);

      return nodeEl;
    });
  }

  update = () => {
    const {
      simulation: {
        getPosition,
      },
    } = this.context;

    this.layoutEls.forEach((el, index) => {
      const relativePosition = getPosition.current(index);
      if (!relativePosition || !el) { return; }

      const screenPosition = this.screen.calculateScreenCoords(relativePosition);
      el.style.left = `${screenPosition.x}px`;
      el.style.top = `${screenPosition.y}px`;
      el.style.display = 'block';
    });

    this.updateRAF = requestAnimationFrame(() => this.update());
  }

  isLinking = (node) => {
    const { connectFrom } = this.props;
    return get(node, entityPrimaryKeyProperty) === connectFrom;
  };

  isHighlighted = (node) => {
    const { highlightAttribute } = this.props;
    return (
      !isEmpty(highlightAttribute)
      && get(node, [entityAttributesProperty, highlightAttribute]) === true
    );
  };

  initializeLayout = (el) => {
    if (!el) { return; }
    this.ref.current = el;
    this.screen.initialize(el);
  };

  // (uuid, index, { dy, dx, x, y })
  handleDragStart = () => {};

  handleDragMove = (uuid, index, delta) => {
    const {
      network: { layout },
      simulation: { simulationEnabled, moveNode },
    } = this.context;

    const { updateNode } = this.props;

    const {
      dy,
      dx,
      x,
      y,
    } = delta;

    if (simulationEnabled) {
      moveNode({ dy, dx }, index);
      return;
    }

    updateNode(
      uuid,
      undefined,
      { [layout]: this.screen.calculateRelativeCoords({ x, y }) },
    );
  };

  handleDragEnd = (uuid, index, { x, y }) => {
    const {
      network: { layout },
      simulation: { simulationEnabled, releaseNode },
    } = this.context;

    const {
      updateNode,
    } = this.props;

    if (simulationEnabled) {
      releaseNode(index);
      return;
    }

    updateNode(
      uuid,
      undefined,
      { [layout]: this.screen.calculateRelativeCoords({ x, y }) },
    );
  };

  render() {
    const {
      network: { nodes },
      viewport,
      simulation: {
        reheat,
        stop,
        simulationEnabled,
        toggleSimulation,
      },
    } = this.context;

    const {
      allowPositioning,
      allowSelect,
      onSelected,
    } = this.props;

    return (
      <>
        <div className="node-layout" ref={this.initializeLayout} />

        <div style={{ position: 'absolute', top: 0, left: 0 }}>
          { !simulationEnabled && (
            <button type="button" onClick={() => toggleSimulation()}>enable simulation</button>
          )}
          { simulationEnabled && (
            <>
              <button type="button" onClick={() => toggleSimulation()}>disable simulation</button>
              <button type="button" onClick={() => reheat()}>reheat</button>
              <button type="button" onClick={() => stop()}>stop</button>
              <button type="button" onClick={() => viewport.zoomViewport(1.5)}>in</button>
              <button type="button" onClick={() => viewport.zoomViewport(0.67)}>out</button>
            </>
          )}
        </div>

        {nodes.map((node, index) => {
          const el = this.layoutEls[index];
          if (!el) { return null; }
          return (
            <LayoutNode
              node={node}
              portal={el}
              index={index}
              key={`${node[entityPrimaryKeyProperty]}_${index}`}
              onDragStart={this.handleDragStart}
              onDragMove={this.handleDragMove}
              onDragEnd={this.handleDragEnd}
              allowPositioning={allowPositioning}
              allowSelect={allowSelect}
              onSelected={onSelected}
              selected={this.isHighlighted(node)}
              linking={this.isLinking(node)}
            />
          );
        })}
      </>
    );
  }
}

NodeLayout.propTypes = {
  onSelected: PropTypes.func.isRequired,
  allowPositioning: PropTypes.bool,
  allowSelect: PropTypes.bool,
};

NodeLayout.defaultProps = {
  allowPositioning: true,
  allowSelect: true,
};

NodeLayout.contextType = LayoutContext;

export { NodeLayout };

export default NodeLayout;

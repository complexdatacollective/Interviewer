/* eslint-disable no-param-reassign */
import React from 'react';
import PropTypes from 'prop-types';
import { isEmpty, get } from 'lodash';
import LayoutContext from '../../contexts/LayoutContext';
import { entityPrimaryKeyProperty, entityAttributesProperty } from '../../ducks/modules/network';
import ScreenManager from './ScreenManager';
import LayoutNode from './LayoutNode';
import SimulationPanel from './SimulationPanel';

class NodeLayout extends React.Component {
  constructor(props) {
    super(props);

    this.ref = React.createRef();
    this.updateRAF = undefined;
    this.layoutEls = [];
    this.screen = ScreenManager();
    this.isDragging = false;
  }

  componentDidMount() {
    this.createLayoutEls();
    this.updateRAF = requestAnimationFrame(() => this.update());
  }

  componentDidUpdate() {
    const { network: { nodes } } = this.context;

    if (this.layoutEls.length !== nodes.length) {
      this.createLayoutEls();
    }
  }

  componentWillUnmount() {
    this.screen.destroy();
    cancelAnimationFrame(this.updateRAF);
  }

  createLayoutEls = () => {
    const { network: { nodes } } = this.context;

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
      getPosition,
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

  handleDragStart = (uuid, index, delta) => {
    this.isDragging = true;

    const {
      network: { layout },
      allowSimulation,
      simulation,
    } = this.context;

    const { updateNode } = this.props;

    const {
      dy,
      dx,
      x,
      y,
    } = delta;

    if (allowSimulation) {
      const { simulationEnabled, moveNode } = simulation;
      if (simulationEnabled) {
        moveNode({ dy, dx }, index);
        return;
      }
    }

    updateNode(
      uuid,
      undefined,
      { [layout]: this.screen.calculateRelativeCoords({ x, y }) },
    );
  };

  handleDragMove = (uuid, index, delta) => {
    const {
      network: { layout },
      allowSimulation,
      simulation,
    } = this.context;

    const { updateNode } = this.props;

    const {
      dy,
      dx,
      x,
      y,
    } = delta;

    if (allowSimulation) {
      const { simulationEnabled, moveNode } = simulation;
      if (simulationEnabled) {
        moveNode({ dy, dx }, index);
        return;
      }
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
      allowSimulation,
      simulation,
    } = this.context;

    const {
      updateNode,
    } = this.props;

    if (allowSimulation) {
      const { simulationEnabled, releaseNode } = simulation;

      if (simulationEnabled) {
        releaseNode(index);
        return;
      }
    }

    updateNode(
      uuid,
      undefined,
      { [layout]: this.screen.calculateRelativeCoords({ x, y }) },
    );
  };

  // When node is dragged this is called last,
  // we can use that to reset isDragging state
  handleSelected = (...args) => {
    const { onSelected } = this.props;
    if (this.isDragging) {
      this.isDragging = false;
      return;
    }
    onSelected(...args);
  };

  renderSimulationPanel() {
    const {
      viewport,
      allowSimulation,
      simulation,
    } = this.context;

    if (!allowSimulation) { return null; }

    const {
      reheat,
      isRunning,
      simulationEnabled,
      toggleSimulation,
    } = simulation;

    return (
      <SimulationPanel
        isSimulationEnabled={simulationEnabled}
        onReheat={reheat}
        onToggleSimulation={toggleSimulation}
        onZoomViewport={viewport.zoomViewport}
        isRunning={isRunning}
        dragConstraints={this.ref}
      />
    );
  }

  render() {
    const {
      network: { nodes },
    } = this.context;

    const {
      allowPositioning,
      allowSelect,
    } = this.props;

    return (
      <>
        <div className="node-layout" ref={this.initializeLayout} />
        {this.renderSimulationPanel()}

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
              onSelected={this.handleSelected}
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

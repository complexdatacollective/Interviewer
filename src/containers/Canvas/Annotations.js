import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import DragManager, { NO_SCROLL } from '../../behaviours/DragAndDrop/DragManager';
import { Fade } from '../../components/Transition';

const AnnotationLines = ({ lines, isDrawing }) => (
  <svg className="annotations__lines" width="100%" height="100%" viewBox="0 0 1 1" preserveAspectRatio="none">
    {lines.map((line, index) => (
      <AnnotationLine
        key={index}
        line={line}
        showLine={isDrawing && index === lines.length - 1}
      />
    ))}
  </svg>
);

AnnotationLines.propTypes = {
  isDrawing: PropTypes.bool.isRequired,
  lines: PropTypes.array.isRequired,
};

const AnnotationLine = ({ line, showLine }) => {
  const pathData = `M ${line.map(point => (`${point.x} ${point.y}`)).join(' L ')}`;

  return (
    <Fade
      in={showLine}
      enter={false}
      duration={{ enter: 0, exit: 3000 * Math.log10(line.length * line.length) }}
    >
      <path className="annotations__path" d={pathData} vectorEffect="non-scaling-stroke" />
    </Fade>
  );
};

AnnotationLine.propTypes = {
  line: PropTypes.array.isRequired,
  showLine: PropTypes.bool.isRequired,
};

class Annotations extends Component {
  constructor() {
    super();

    this.state = {
      lines: [],
      isDrawing: false,
    };

    this.dragManager = null;
    this.portal = document.createElement('div');
    this.portal.className = 'annotations';
  }

  componentDidMount() {
    const nodeListRoot = document.getElementsByClassName('node-layout').length > 0 ?
      document.getElementsByClassName('node-layout')[0] :
      document.getElementById('narrative-interface__canvas');
    if (nodeListRoot) {
      nodeListRoot.insertBefore(this.portal, nodeListRoot.firstChild);
    }

    if (this.props.freeDraw) {
      this.dragManager = new DragManager({
        el: this.portal,
        onDragStart: this.onDragStart,
        onDragMove: this.onDragMove,
        onDragEnd: this.onDragEnd,
        scrollDirection: NO_SCROLL,
      });
    }
  }

  componentWillUnmount() {
    if (this.portal) {
      this.portal.remove();
    }
    this.cleanupDragManager();
  }

  onDragStart = (mouseEvent) => {
    const point = this.relativeCoordinatesForEvent(mouseEvent);
    const lines = this.state.lines.slice();
    lines.push([point]);

    this.setState({
      lines,
      isDrawing: true,
    });
  };

  onDragMove = (mouseEvent) => {
    if (!this.state.isDrawing) {
      return;
    }

    const point = this.relativeCoordinatesForEvent(mouseEvent);
    const lines = this.state.lines.slice();
    lines[lines.length - 1].push(point);

    this.setState({
      lines,
    });
  };

  onDragEnd = () => {
    this.setState({ isDrawing: false });
  };

  cleanupDragManager = () => {
    if (this.dragManager) {
      this.dragManager.unmount();
      this.dragManager = null;
    }
  };

  relativeCoordinatesForEvent(mouseEvent) {
    const boundingRect = this.portal.getBoundingClientRect();
    return ({
      x: (mouseEvent.x - boundingRect.left) / boundingRect.width,
      y: (mouseEvent.y - boundingRect.top) / boundingRect.height,
    });
  }

  removeLine = () => {
    const lines = this.state.lines.slice(1);
    this.setState({
      lines,
    });
  }

  render() {
    return ReactDOM.createPortal(
      (
        <AnnotationLines
          lines={this.state.lines}
          isDrawing={this.state.isDrawing}
        />
      ),
      this.portal,
    );
  }
}

Annotations.propTypes = {
  freeDraw: PropTypes.bool,
};

Annotations.defaultProps = {
  freeDraw: true,
};

export default Annotations;

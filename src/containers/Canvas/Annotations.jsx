import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { Fade } from '@codaco/ui/lib/components/Transitions';
import DragManager, { NO_SCROLL } from '../../behaviours/DragAndDrop/DragManager';

const AnnotationLines = ({
  lines, isDrawing, isFrozen, linesShowing, linesToFade, onLineFaded,
}) => (
  <svg className="annotations__lines" width="100%" height="100%" viewBox="0 0 1 1" preserveAspectRatio="none">
    {lines.map((line, index) => {
      const handleLineGone = () => onLineFaded(index);
      return (
        <AnnotationLine
          key={index}
          line={line}
          showLine={(isDrawing && index === lines.length - 1) || !!linesToFade[index]}
          freezeLine={isFrozen && !!linesShowing[index]}
          onLineFaded={handleLineGone}
        />
      );
    })}
  </svg>
);

AnnotationLines.propTypes = {
  isDrawing: PropTypes.bool.isRequired,
  isFrozen: PropTypes.bool.isRequired,
  lines: PropTypes.array.isRequired,
  linesShowing: PropTypes.array.isRequired,
  linesToFade: PropTypes.array.isRequired,
  onLineFaded: PropTypes.func.isRequired,
};

const AnnotationLine = ({
  line,
  showLine,
  freezeLine,
  onLineFaded,
}) => {
  const pathData = `M ${line.map((point) => (`${point.x} ${point.y}`)).join(' L ')}`;
  let path = (
    <Fade
      in={showLine}
      enter={false}
      customDuration={{ enter: 0, exit: 3000 * Math.log10(line.length ** 2) }}
      onExited={onLineFaded}
    >
      <path className="annotations__path" d={pathData} vectorEffect="non-scaling-stroke" />
    </Fade>
  );
  if (freezeLine) {
    path = <path className="annotations__path" d={pathData} vectorEffect="non-scaling-stroke" />;
  }

  return (
    path
  );
};

AnnotationLine.propTypes = {
  freezeLine: PropTypes.bool.isRequired,
  line: PropTypes.array.isRequired,
  onLineFaded: PropTypes.func.isRequired,
  showLine: PropTypes.bool.isRequired,
};

class Annotations extends Component {
  constructor() {
    super();

    this.state = {
      lines: [],
      linesShowing: [],
      linesToFade: [],
      activeLines: 0,
      isDrawing: false,
    };

    this.dragManager = null;
    this.removeLineTimers = [];
    this.portal = document.createElement('div');
    this.portal.className = 'annotations';
  }

  componentDidMount() {
    const nodeListRoot = document.getElementsByClassName('node-layout').length > 0
      ? document.getElementsByClassName('node-layout')[0]
      : document.getElementById('narrative-interface__canvas');
    if (nodeListRoot) {
      nodeListRoot.insertBefore(this.portal, nodeListRoot.firstChild);
    }

    this.dragManager = new DragManager({
      el: this.portal,
      onDragStart: this.onDragStart,
      onDragMove: this.onDragMove,
      onDragEnd: this.onDragEnd,
      scrollDirection: NO_SCROLL,
    });
  }

  componentDidUpdate(prevProps) {
    const { isFrozen } = this.props;
    if (prevProps.isFrozen !== isFrozen) {
      if (isFrozen) {
        this.freeze();
      } else {
        this.unfreeze();
      }
    }
  }

  componentWillUnmount() {
    this.cleanupDragManager();
    this.resetRemoveLineTimers();

    if (this.portal) {
      this.portal.remove();
    }
  }

  onDragStart = (mouseEvent) => {
    const {
      lines,
      linesShowing,
      activeLines,
    } = this.state;
    const { onChangeActiveAnnotations } = this.props;
    const point = this.relativeCoordinatesForEvent(mouseEvent);
    const nextLines = [...lines, [point]];
    const nextLinesShowing = [...linesShowing, true];

    this.setState({
      lines: nextLines,
      linesShowing: nextLinesShowing,
      activeLines: activeLines + 1,
      isDrawing: true,
    });

    onChangeActiveAnnotations(true);
  };

  onDragMove = (mouseEvent) => {
    const {
      isDrawing,
      lines,
    } = this.state;

    if (!isDrawing) {
      return;
    }

    const point = this.relativeCoordinatesForEvent(mouseEvent);
    const nextLines = [...lines];
    nextLines[nextLines.length - 1].push(point);

    this.setState({
      lines: nextLines,
    });
  };

  onDragEnd = () => {
    const { isFrozen } = this.props;
    const { lines } = this.state;

    this.setState({ isDrawing: false });
    if (isFrozen) return;

    // Add a setTimeout that will trigger line starting to fade.
    this.removeLineTimers.push(
      setTimeout(
        this.fadeLines.bind(null, lines.length - 1),
        1000,
      ),
    );
  };

  fadeLines = (position) => {
    const { linesToFade } = this.state;
    const nextLinesToFade = [...linesToFade];
    nextLinesToFade[position] = false;

    this.setState({
      linesToFade: nextLinesToFade,
    });
  }

  // callback from line Fade, reduces activeLines count as lines disappear
  handleLineGone = (position) => {
    const {
      linesShowing,
      activeLines,
    } = this.state;

    const { onChangeActiveAnnotations } = this.props;

    const nextLinesShowing = [...linesShowing];
    nextLinesShowing[position] = false;

    this.setState({
      activeLines: activeLines - 1,
      linesShowing: nextLinesShowing,
    }, () => {
      if (activeLines === 0) {
        onChangeActiveAnnotations(false);
      }
    });
  }

  freeze = () => {
    this.resetRemoveLineTimers();
  }

  unfreeze = () => {
    const { linesShowing } = this.state;
    const nextLinesToFade = [...linesShowing];

    this.setState({
      linesToFade: nextLinesToFade,
    });

    linesShowing.forEach((showing, index) => {
      if (showing) {
        this.removeLineTimers.push(
          setTimeout(
            this.fadeLines.bind(null, index),
            1000,
          ),
        );
      }
    });
  }

  // Called by parent component via ref when the reset button is clicked.
  reset = () => {
    const { onChangeActiveAnnotations } = this.props;

    this.setState({
      lines: [],
      activeLines: 0,
      linesToFade: [],
      linesShowing: [],
      isDrawing: false,
    });

    this.resetRemoveLineTimers();
    onChangeActiveAnnotations(false);
  };

  resetRemoveLineTimers = () => {
    if (this.removeLineTimers) {
      this.removeLineTimers.forEach((timer) => {
        clearTimeout(timer);
      });
      this.removeLineTimers = [];
    }
  }

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

  render() {
    const {
      lines,
      linesShowing,
      linesToFade,
      isDrawing,
    } = this.state;
    const { isFrozen } = this.props;

    return ReactDOM.createPortal(
      (
        <AnnotationLines
          lines={lines}
          isFrozen={isFrozen}
          linesShowing={linesShowing}
          linesToFade={linesToFade}
          isDrawing={isDrawing}
          onLineFaded={this.handleLineGone}
        />
      ),
      this.portal,
    );
  }
}

Annotations.propTypes = {
  isFrozen: PropTypes.bool.isRequired,
  onChangeActiveAnnotations: PropTypes.func.isRequired,
};

export default Annotations;

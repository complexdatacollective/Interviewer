/* eslint-disable no-underscore-dangle */
import getAbsoluteBoundingRect from './getAbsoluteBoundingRect';

const getSize = (element) => {
  const boundingClientRect = getAbsoluteBoundingRect(element);

  return {
    width: Math.floor(boundingClientRect.width),
    height: Math.floor(boundingClientRect.height),
  };
};

const styles = (x, y) =>
  `display: inline-block; position: absolute; left: 0px; top: 0px; transform: translate(${x}px, ${y}px);`;

const parent = () => document.getElementById('page-wrap');

export default class DraggablePreview {
  constructor(node) {
    this.node = document.createElement('div');
    this.node.setAttribute('class', 'draggable-preview');
    this.x = -1000;
    this.y = -1000;

    this.update();

    const clone = node.cloneNode(true);

    this.node.appendChild(clone);

    parent().appendChild(this.node);
  }

  size() {
    if (!this.node) { return { width: 0, height: 0 }; }
    if (!this._size) { this._size = getSize(this.node); }
    return this._size;
  }

  center() {
    if (!this._center) {
      this._center = {
        x: Math.floor(this.size().width / 2),
        y: Math.floor(this.size().height / 2),
      };
    }
    return this._center;
  }

  update = () => {
    this.render();
    this.animationFrame = window.requestAnimationFrame(this.update);
  }

  render() {
    this.node.setAttribute('style', styles(this.x, this.y));
  }

  position(coords) {
    this.x = coords.x - this.center().x;
    this.y = coords.y - this.center().y;
  }

  cleanup() {
    window.cancelAnimationFrame(this.animationFrame);
    parent().removeChild(this.node);
  }
}

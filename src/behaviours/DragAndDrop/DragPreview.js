/* eslint-disable no-underscore-dangle */

import getAbsoluteBoundingRect from '../../utils/getAbsoluteBoundingRect';

const getSize = (element) => {
  const boundingClientRect = getAbsoluteBoundingRect(element);

  return {
    width: Math.floor(boundingClientRect.width),
    height: Math.floor(boundingClientRect.height),
  };
};

const styles = (width, height, x, y) => `width: ${width}px; height: ${height}px; display: inline-block; position: absolute; left: 0px; top: 0px; transform: translate(${x}px, ${y}px);`;

const body = () => document.getElementsByTagName('body')[0];

export default class DraggablePreview {
  constructor(node) {
    this.node = document.createElement('div');
    this.initialSize = getSize(node);
    this.node.setAttribute('class', 'draggable-preview');
    this.validMove = true;

    this.update();

    const clone = node.cloneNode(true);

    this.node.appendChild(clone);

    body().appendChild(this.node);
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
    this.node.setAttribute('style', styles(this.initialSize.width, this.initialSize.height, this.x, this.y));

    if (this.validMove) {
      this.node.setAttribute('class', 'draggable-preview');
    } else {
      this.node.setAttribute('class', 'draggable-preview draggable-preview--invalid');
    }
  }

  position(coords) {
    this.x = coords.x - this.center().x;
    this.y = coords.y - this.center().y;
  }

  setValidMove(valid) {
    this.validMove = valid;
  }

  cleanup() {
    window.cancelAnimationFrame(this.animationFrame);
    body().removeChild(this.node);
  }
}

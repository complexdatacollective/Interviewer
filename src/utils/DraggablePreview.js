/* eslint-disable no-underscore-dangle */
import { throttle } from 'lodash';
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
    this.position = throttle(this.position, 1000 / 60);

    this.node = document.createElement('div');
    this.node.setAttribute('class', 'draggable-preview');
    this.node.setAttribute('style', styles(-1000, -1000));

    const animationLayer = document.createElement('div');
    animationLayer.setAttribute('class', 'draggable-preview__animation');
    animationLayer.appendChild(node.cloneNode(true));

    this.node.appendChild(animationLayer);

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

  position(coords) {
    const x = coords.x - this.center().x;
    const y = coords.y - this.center().y;
    this.node.setAttribute('style', styles(x, y));
  }

  cleanup() {
    parent().removeChild(this.node);
  }
}

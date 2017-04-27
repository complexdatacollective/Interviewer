import { throttle } from 'lodash';
import getAbsoluteBoundingRect from './getAbsoluteBoundingRect';

const getSize = (element) => {
  const boundingClientRect = getAbsoluteBoundingRect(element);

  return {
    width: Math.floor(boundingClientRect.width),
    height: Math.floor(boundingClientRect.height),
  }
}

export default class DraggablePreview {
  constructor(node) {
    this.position = throttle(this.position, 1000/60);

    this.node = document.createElement('div');
    this.node.setAttribute('class', 'draggable-preview');
    this.node.appendChild(node.cloneNode(true));

    this.parent().appendChild(this.node);
  }

  parent() {
    return document.getElementById('page-wrap');
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
      }
    }
    return this._center;
  }

  position(x, y) {
    x = x - this.center().x;
    y = y - this.center().y;
    this.node.setAttribute('style', `position: absolute; left: 0px; top: 0px; transform: translate(${x}px, ${y}px);`);
  }

  cleanup() {
    this.parent().removeChild(this.node);
  }
}

/* eslint-disable */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

const textOutOfBounds = (containerElement, textElement) => {
  const containerBounds = containerElement.getBoundingClientRect();
  const textBounds = textElement.getBoundingClientRect();
  return textBounds.height > containerBounds.height || textBounds.width > containerBounds.width;
};

const scaleIncrement = 1;

// TODO move padding: 33% into stylesheet
function scaleTextToFit(element) {
  element.setAttribute('style', 'position: relative; width: 100%; height: 100%;');
  const text = element.textContent;
  element.innerHTML = '';

  const textElement = document.createElement('span');
  textElement.innerHTML = text;
  element.appendChild(textElement);

  const findFontSize = (size) => {
    textElement.setAttribute('style', `position: absolute; font-size: ${size}px;`);

    return !textOutOfBounds(element, textElement) ?
      findFontSize(size + scaleIncrement) :
      size - scaleIncrement;
  };

  const fontSize = findFontSize(8);

  element.innerHTML = text;
  element.setAttribute('style', `font-size: ${fontSize}px; width: 100%; height: 100%; overflow: hidden;display: flex;justify-content: center;align-items: center;flex-wrap: nowrap;`);
}

/**
  * Renders a Node.
  */
class Node extends Component {
  componentDidMount() {
    scaleTextToFit(this.labelTextElement());
  }

  componentDidUpdate(prevProps) {
    if (prevProps.label !== this.props.label) {
      scaleTextToFit(this.labelTextElement());
    }
  }

  labelTextElement() {
    return this.node.querySelectorAll('.node__label-text')[0];
  }

  render() {
    const {
      selected,
      placeholder,
    } = this.props;

    const classes = classNames(
      'node',
      {
        'node--selected': selected,
        'node--placeholder': placeholder,
      },
    );

    const label = placeholder ? '+' : this.props.label;

    return (
      <div
        className={classes}
        ref={(node) => { this.node = node; }}
      >
        <svg
          viewBox="-1.5 -1.5 3 3"
          xmlns="http://www.w3.org/2000/svg"
          width="100"
          height="100"
          className="node__node"
        >
          <circle vectorEffect="non-scaling-stroke" cx="0" cy="0" r="1" className="node__node-outer-trim" />
          <circle cx="0" cy="0" r="1" fill="silver" className="node__node-base" />
          <path
            className="node__node-flash"
            d="M -1 0 A 0.2,0.2 0 1,1 1,0"
            fill="grey"
            transform="rotate(135)"
          />
          <circle vectorEffect="non-scaling-stroke" cx="0" cy="0" r="1" className="node__node-trim" />
        </svg>
        <div className="node__label" style={{ padding: '33%' }}>
          <div className="node__label-text" style={{ width: '100%', height: '100%' }}>{label}</div>
        </div>
      </div>
    );
  }
}

Node.propTypes = {
  label: PropTypes.string,
  selected: PropTypes.bool,
  placeholder: PropTypes.bool,
};

Node.defaultProps = {
  label: 'Node',
  selected: false,
  placeholder: false,
};

export default Node;

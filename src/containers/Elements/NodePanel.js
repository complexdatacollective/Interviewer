/* eslint-disable */

import React, { Component } from 'react';
import { colorDictionary } from 'network-canvas-ui';
import { NodeProvider } from '../Elements';
import { Panel } from '../../components/Elements';

const colorPresets = [
  colorDictionary['edge-alt-1'],
  colorDictionary['edge-alt-2'],
  colorDictionary['edge-alt-3'],
  colorDictionary['edge-alt-4'],
  colorDictionary['edge-alt-5'],
];

const getHighlight = (highlight, panelNumber) => {
  if (colorDictionary[highlight]) { return colorDictionary[highlight]; }
  if (panelNumber > 0) { return colorPresets[panelNumber % colorPresets.length]; }
  return null;
};

/**
  * Renders an interactive list of nodes for addition to the network.
  * @extends Component
  */
class NodePanel extends Component {
  render() {
    const { title, index, highlight, ...rest } = this.props;

    return (
      <Panel
        title={title}
        key={index}
        highlight={getHighlight(highlight, index)}
      >
        <NodeProvider
          {...rest}
        />
      </Panel>
    );
  }
}

export default NodePanel;

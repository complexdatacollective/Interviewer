import React from 'react';
import PropTypes from 'prop-types';
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
const NodePanel = ({
  title,
  index,
  highlight,
  ...rest
}) => (
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

NodePanel.propTypes = {
  title: PropTypes.string,
  index: PropTypes.number,
  highlight: PropTypes.bool,
};

NodePanel.defaultProps = {
  title: '',
  index: null,
  highlight: false,
};

export default NodePanel;

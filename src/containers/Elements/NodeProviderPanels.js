import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { colorDictionary } from 'network-canvas-ui';
import { createSelector } from 'reselect';
import { has, map, some } from 'lodash';
import { Panels, Panel } from '../../components/Elements';
import { NodeProvider } from '../Elements';

const colorPresets = [
  colorDictionary['edge-alt-1'],
  colorDictionary['edge-alt-2'],
  colorDictionary['edge-alt-3'],
  colorDictionary['edge-alt-4'],
  colorDictionary['edge-alt-5'],
];

const panelPresets = {
  existing: {
    title: 'Already mentioned',
    dataSource: 'existing',
    droppable: true,
    filter: network => network,
  },
  external: {
    title: 'People from your previous visit',
    dataSource: 'previousInterview',
    filter: network => network,
  },
};

const rehydratePreset = (panelConfig) => {
  if (has(panelPresets, panelConfig)) {
    return panelPresets[panelConfig];
  }
  return panelConfig;
};

const propPanelConfigs = (_, props) => props.stage.panels;

const getPanelConfigs = createSelector(
  propPanelConfigs,
  panelConfigs => map(panelConfigs, rehydratePreset),
);

const getHighlight = (provider, panelNumber) => {
  if (colorDictionary[provider.highlight]) { return colorDictionary[provider.highlight]; }
  if (panelNumber > 0) { return colorPresets[panelNumber % colorPresets.length]; }
  return null;
};

/**
  * Configures and renders `NodeProvider`s into panels according to the protocol config
  */
class NodeProviderPanels extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      panelsOpen: map(props.panels, () => true),
      panelsDragging: map(props.panels, () => false),
    };
  }

  onUpdatePanelState = (updateIndex, state) => {
    this.setState(previousState => ({
      panelsOpen: map(
        previousState.panelsOpen,
        (item, index) => {
          if (updateIndex === index) { return state; }
          return item;
        },
      ),
    }));
  }

  onUpdateNodeDragging = (panelIndex, show) => {
    this.setState(previousState => ({
      panelsDragging: map(
        previousState.panelsDragging,
        (item, index) => {
          if (panelIndex === index) { return show; }
          return item;
        },
      ),
    }));
  };

  panelIsDragging = index => this.state.panelsDragging[index];

  panelHasNodes = index => this.state.panelsOpen[index];

  isPanelOpen = index => this.panelHasNodes(index) || this.panelIsDragging(index);

  anyPanelIsDragging = () => some(
    map(this.state.panelsDragging, (value, index) => this.panelIsDragging(index)),
    show => show === true,
  );

  anyPanelHasNodes = () => some(
    map(this.state.panelsOpen, (value, index) => this.panelHasNodes(index)),
    open => open === true,
  );

  anyPanelOpen = () => this.anyPanelHasNodes() || this.anyPanelIsDragging();

  render() {
    const { panels, stage, prompt } = this.props;

    return (
      <Panels minimise={!this.anyPanelOpen()}>
        { panels.map((panel, panelIndex) => (
          <Panel
            title={panel.title}
            key={panelIndex}
            minimise={!this.isPanelOpen(panelIndex)}
            highlight={getHighlight(panel, panelIndex)}
          >
            <NodeProvider
              {...panel}
              stage={stage}
              prompt={prompt}
              onUpdateNodes={nodes => this.onUpdatePanelState(panelIndex, nodes.length !== 0)}
              onDrag={show => this.onUpdateNodeDragging(panelIndex, show)}
              nodeColor={panel.nodeColor}
            />
          </Panel>
        )) }
      </Panels>
    );
  }
}

NodeProviderPanels.propTypes = {
  panels: PropTypes.array.isRequired,
  stage: PropTypes.object.isRequired,
  prompt: PropTypes.object.isRequired,
};

function mapStateToProps(state, props) {
  return {
    panels: getPanelConfigs(state, props),
  };
}

export default connect(mapStateToProps)(NodeProviderPanels);

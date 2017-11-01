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
    selectable: true,
    filter: network => network,
  },
  external: {
    title: 'People from your previous visit',
    dataSource: 'previousInterview',
    draggable: true,
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
  if (provider.highlight) { return provider.highlight; }
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
      panels: map(props.panels, () => true),
    };
  }

  onUpdatePanelState = (updateIndex, state) => {
    this.setState(previousState => ({
      panels: map(
        previousState.panels,
        (item, index) => {
          if (updateIndex === index) { return state; }
          return item;
        },
      ),
    }));
  }

  isPanelOpen = index => this.state.panels[index];

  anyPanelOpen = () => some(
    map(this.state.panels, (value, index) => this.isPanelOpen(index)),
    open => open === true,
  );

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

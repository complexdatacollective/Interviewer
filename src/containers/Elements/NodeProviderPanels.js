import React, { Component } from 'react';

import { Panels, Panel } from '../../components/Elements';
import { NodeProvider } from '../Elements';

const providerPresets = {
  'existing': {
    type: 'existing',
    title: 'People from your existing lists',
    source: 'existing',
    selectable: true,
  },
  'previous': {
    type: 'previous',
    title: 'People from your previous visit',
    source: 'previous',
    draggable: true,
  },
}

const getProviderConfig = (provider) => {
  if(!provider) { return () => { return true; } }  // TODO: rehydrate looses methods, this puts a placehoder back in
  if(providerPresets.hasOwnProperty(provider)) { return providerPresets[provider]; }
  return provider;
}

/** Figures out the panel config, and renders the relevant components with that config **/
class NodeProviderPanels extends Component {
  render() {
    const {
      config,
    } = this.props;

    const panels = config.map((panel, index) => {
      const providerConfig = getProviderConfig(panel);

      return (
        <Panel title={ providerConfig.title } key={ index }>
          <NodeProvider { ...providerConfig } activeNodeAttributes={ this.props.activeNodeAttributes } />
        </Panel>
      );
    });

    return (
      <Panels>
        { panels }
      </Panels>
    );
  }
}
export default NodeProviderPanels;

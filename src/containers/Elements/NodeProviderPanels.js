import React from 'react';
import PropTypes from 'prop-types';
import { Panels, Panel } from '../../components/Elements';
import { NodeProvider } from '../Elements';

const providerPresets = {
  existing: {
    type: 'existing',
    title: 'People from your existing lists',
    source: 'existing',
    selectable: true,
    filter: network => network,
  },
  previous: {
    type: 'previous',
    title: 'People from your previous visit',
    source: 'previous',
    draggable: true,
    filter: network => network,
  },
};

const getProviderConfig = (provider) => {
  // TODO: rehydrate looses methods, this puts a placehoder back in
  if (!provider) { return () => true; }
  if (Object.prototype.hasOwnProperty.call(providerPresets, provider)) {
    return providerPresets[provider];
  }
  return provider;
};

/** Figures out the panel config, and renders the relevant components with that config **/
const NodeProviderPanels = (props) => {
  const panels = props.config.map((panel, index) => {
    const providerConfig = getProviderConfig(panel);

    return (
      <Panel title={providerConfig.title} key={index}>
        <NodeProvider {...providerConfig} />
      </Panel>
    );
  });

  return (
    <Panels>
      {panels}
    </Panels>
  );
};

NodeProviderPanels.propTypes = {
  config: PropTypes.any.isRequired,
};

export default NodeProviderPanels;

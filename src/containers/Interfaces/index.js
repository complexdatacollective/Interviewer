/* eslint-disable import/prefer-default-export */
import React from 'react';
import { has } from 'lodash';
import { Icon } from 'network-canvas-ui';
import NameGenerator from './NameGenerator';
import NameGeneratorAutoComplete from './NameGeneratorAutoComplete';
import OrdinalScale from './OrdinalScale';
import NameGeneratorList from './NameGeneratorList';
import Sociogram from './Sociogram';
import Quiz from './Quiz';
import Information from './Information';

const interfaces = {
  NameGenerator,
  NameGeneratorAutoComplete,
  NameGeneratorList,
  Sociogram,
  Quiz,
  Information,
  OrdinalScale,
};

const getInterface = (interfaceConfig) => {
  const divStyle = {
    display: 'flex',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  };

  if (has(interfaceConfig, 'custom')) { return interfaceConfig.custom; }
  if (has(interfaces, interfaceConfig)) { return interfaces[interfaceConfig]; }
  return () => (<div style={divStyle}><div style={{ textAlign: 'center' }}><Icon name="warning" /><h1 style={{ marginTop: '10px' }}>No &quot;{interfaceConfig}&quot; interface found.</h1></div></div>);
};

export {
  NameGenerator,
  NameGeneratorAutoComplete,
  NameGeneratorList,
  Sociogram,
  Quiz,
  Information,
  OrdinalScale,
};

export default getInterface;

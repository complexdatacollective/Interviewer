/* eslint-disable import/prefer-default-export */
import React from 'react';
import { has } from 'lodash';
import { Icon } from '../../ui/components';
import NameGenerator from './NameGenerator';
import NameGeneratorAutoComplete from './NameGeneratorAutoComplete';
import OrdinalBin from './OrdinalBin';
import NameGeneratorList from './NameGeneratorList';
import Sociogram from './Sociogram';
import Quiz from './Quiz';
import Information from './Information';
import FinishSession from './FinishSession';

const interfaces = {
  NameGenerator,
  NameGeneratorAutoComplete,
  NameGeneratorList,
  Sociogram,
  Quiz,
  Information,
  OrdinalBin,
  FinishSession,
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
  return () => (<div style={divStyle}><div style={{ textAlign: 'center' }}><Icon name="warning" /><h1 style={{ marginTop: '1rem' }}>No &quot;{interfaceConfig}&quot; interface found.</h1></div></div>);
};

export {
  NameGenerator,
  NameGeneratorAutoComplete,
  NameGeneratorList,
  Sociogram,
  Quiz,
  Information,
  OrdinalBin,
};

export default getInterface;

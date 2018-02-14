/* eslint-disable import/prefer-default-export */
import React from 'react';
import { has } from 'lodash';
import NameGenerator from './NameGenerator';
import NameGeneratorAutoComplete from './NameGeneratorAutoComplete';
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
};

const getInterface = (interfaceConfig) => {
  if (has(interfaceConfig, 'custom')) { return interfaceConfig.custom; }
  if (has(interfaces, interfaceConfig)) { return interfaces[interfaceConfig]; }
  return () => (<div>No &quot;{interfaceConfig}&quot; interface found.</div>);
};

export {
  NameGenerator,
  NameGeneratorAutoComplete,
  NameGeneratorList,
  Sociogram,
  Quiz,
  Information,
};

export default getInterface;

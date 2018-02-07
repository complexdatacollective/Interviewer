/* eslint-disable import/prefer-default-export */
import React from 'react';
import { has } from 'lodash';
import NameGenerator from './NameGenerator';
import NameGeneratorList from './NameGeneratorList';
import Sociogram from './Sociogram';
import Quiz from './Quiz';
import Instructions from './Instructions';

const interfaces = {
  NameGenerator,
  NameGeneratorList,
  Sociogram,
  Quiz,
  Instructions,
};

const getInterface = (interfaceConfig) => {
  if (has(interfaceConfig, 'custom')) { return interfaceConfig.custom; }
  if (has(interfaces, interfaceConfig)) { return interfaces[interfaceConfig]; }
  return () => (<div>No &quot;{interfaceConfig}&quot; interface found.</div>);
};

export {
  NameGenerator,
  NameGeneratorList,
  Sociogram,
  Quiz,
  Instructions,
};

export default getInterface;

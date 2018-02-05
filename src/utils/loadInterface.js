import React from 'react';
import {
  NameGeneratorInterface,
  NameGeneratorListInterface,
  QuizInterface,
  SociogramInterface,
} from '../containers/Interfaces';

export default function loadInterface(options) {
  if (Object.hasOwnProperty.call(options, 'custom')) { return options.custom; }
  switch (options) {
    case 'NameGenerator':
      return NameGeneratorInterface;
    case 'NameGeneratorList':
      return NameGeneratorListInterface;
    case 'Sociogram':
      return SociogramInterface;
    case 'Quiz':
      return QuizInterface;
    default:
      return () => (<div>No &quot;{options}&quot; interface found.</div>);
  }
}

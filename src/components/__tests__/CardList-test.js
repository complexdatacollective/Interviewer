/* eslint-env jest */

import React from 'react';
import { shallow } from 'enzyme';
import CardList from '../CardList';

const nodes = [
  { uid: 'a', name: 'a name', age: '22' },
  { uid: 'b', name: 'b name', age: '88' },
  { uid: 'c', name: 'c name', age: '33' },
];

describe('CardList component', () => {
  it('renders cards with list', () => {
    const component = shallow(
      <CardList nodes={nodes} label={node => node.name} details={node => [{ age: `${node.age}` }]} />,
    );

    expect(component).toMatchSnapshot();
  });
});

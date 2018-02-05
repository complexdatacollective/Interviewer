/* eslint-env jest */

import React from 'react';
import { shallow } from 'enzyme';
import ListSelect from '../ListSelect';

const nodes = [
  { uid: 'a', name: 'a name', age: '22' },
  { uid: 'b', name: 'b name', age: '88' },
  { uid: 'c', name: 'c name', age: '33' },
];

describe('ListSelect component', () => {
  it('renders ok', () => {
    const component = shallow((
      <ListSelect
        name="foo"
        nodes={nodes}
      />
    ));

    expect(component).toMatchSnapshot();
  });
});

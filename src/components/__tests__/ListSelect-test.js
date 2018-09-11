/* eslint-env jest */

import React from 'react';
import { shallow } from 'enzyme';
import ListSelect from '../ListSelect';

jest.mock('../../utils/CSSVariables');

const nodes = [
  { uid: 'a', attributes: { name: 'a name', age: '22' } },
  { uid: 'b', attributes: { name: 'b name', age: '88' } },
  { uid: 'c', attributes: { name: 'c name', age: '33' } },
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

/* eslint-env jest */

import React from 'react';
import { shallow } from 'enzyme';
import { NodeBucket } from '../../Elements/NodeBucket';

const mockProps = {
  node: {},
  updateNode: () => {},
  layout: 'foo',
  sort: {},
};

describe('<NodeBucket />', () => {
  it('renders ok', () => {
    const component = shallow(<NodeBucket {...mockProps} />);

    expect(component).toMatchSnapshot();
  });
});

/* eslint-env jest */

import React from 'react';
import { shallow } from 'enzyme';
import { NodeBucket } from '../NodeBucket';

const mockProps = {
  node: { label: 'some label' },
  allowPositioning: true,
};

describe('<NodeBucket />', () => {
  it('displays content when positioning is not disabled', () => {
    const component = shallow(<NodeBucket {...mockProps} />);
    expect(component.children()).toHaveLength(1);
  });

  it('does not display bucket when positioning is disabled', () => {
    const component = shallow(<NodeBucket {...mockProps} allowPositioning={false} />);
    expect(component.children()).toHaveLength(0);
  });
});

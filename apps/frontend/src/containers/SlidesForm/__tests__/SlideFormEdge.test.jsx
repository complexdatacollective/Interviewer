/* eslint-env jest */

import React from 'react';
import { shallow } from 'enzyme';
import { entityAttributesProperty } from '@codaco/shared-consts';
import { SlideFormEdge } from '../SlideFormEdge';

const mockProps = {
  item: {
    to: 2,
    from: 1,
  },
  edgeColor: 'blue',
  nodes: {
    1: { name: 'One' },
    2: { name: 'Two' },
  },
  form: {
    title: 'alpha',
    entity: 'edge',
    type: 'friend',
  },
  edgeIndex: 1,
  stageIndex: 1,
};

const mockItem = {
  [entityAttributesProperty]: {
    foo: 'bar',
  },
};

describe('<SlideFormEdge />', () => {
  it('should render', () => {
    const component = shallow(<SlideFormEdge {...mockProps} />);
    expect(component).toMatchSnapshot();
  });

  it('should render with prepopulated fields if provided', () => {
    const subject = shallow(<SlideFormEdge {...mockProps} item={mockItem} />);
    expect(
      subject.prop('initialValues'),
    ).toEqual({ foo: 'bar' });
  });
});

/* eslint-env jest */

import React from 'react';
import { shallow } from 'enzyme';
import { entityAttributesProperty } from '@codaco/shared-consts';
import { SlideFormNode as SlideForm } from '../SlideFormNode';

const mockProps = {
  form: {
    title: 'alpha',
    entity: 'node',
    type: 'person',
  },
  nodeIndex: 1,
  stageIndex: 1,
  item: {},
};

const mockItem = {
  [entityAttributesProperty]: {
    foo: 'bar',
  },
};

describe('<SlideFormNode />', () => {
  it('should render', () => {
    const component = shallow(<SlideForm {...mockProps} item={mockItem} />);
    expect(component).toMatchSnapshot();
  });

  it('should render with prepopulated fields if provided', () => {
    const subject = shallow(<SlideForm {...mockProps} item={mockItem} />);
    expect(
      subject.prop('initialValues'),
    ).toEqual({ foo: 'bar' });
  });
});

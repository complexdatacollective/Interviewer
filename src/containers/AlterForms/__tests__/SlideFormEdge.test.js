/* eslint-env jest */

import React from 'react';
import { shallow } from 'enzyme';
import { SlideFormEdge } from '../SlideFormEdge';
import { entityAttributesProperty } from '../../../ducks/modules/network';

const mockProps = {
  edge: {
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

describe('<SlideFormEdge />', () => {
  it('should render', () => {
    const component = shallow(<SlideFormEdge {...mockProps} />);
    expect(component).toMatchSnapshot();
  });

  it('should render with prepopulated fields if provided', () => {
    const withInitialValues = {
      [entityAttributesProperty]: {
        foo: 'bar',
      },
    };
    const subject = shallow(<SlideFormEdge {...mockProps} edge={withInitialValues} />);
    expect(subject.find('.alter-form__form')).toHaveLength(1);
    expect(
      (subject.find('.alter-form__form')).prop('initialValues'),
    ).toEqual({ foo: 'bar' });
  });
});

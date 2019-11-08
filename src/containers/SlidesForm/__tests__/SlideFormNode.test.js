/* eslint-env jest */

import React from 'react';
import { shallow } from 'enzyme';
import SlideForm from '../SlideFormNode';
import { entityAttributesProperty } from '../../../ducks/modules/network';

const mockProps = {
  form: {
    title: 'alpha',
    entity: 'node',
    type: 'person',
  },
  nodeIndex: 1,
  stageIndex: 1,
};

describe('<SlideFormNode />', () => {
  it('should render', () => {
    const component = shallow(<SlideForm {...mockProps} node={{ name: 'Bob' }} />);
    expect(component).toMatchSnapshot();
  });

  it('should render with prepopulated fields if provided', () => {
    const withInitialValues = {
      [entityAttributesProperty]: {
        foo: 'bar',
      },
    };
    const subject = shallow(<SlideForm {...mockProps} node={withInitialValues} />);
    expect(subject.find('.alter-form__form')).toHaveLength(1);
    expect(
      (subject.find('.alter-form__form')).prop('initialValues'),
    ).toEqual({ foo: 'bar' });
  });
});

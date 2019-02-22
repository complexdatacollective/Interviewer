/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { EgoForm } from '../EgoForm';

const requiredProps = {
  form: {
    title: 'alpha',
    entity: 'ego',
  },
  introductionPanel: { title: 'intro', text: 'content' },
  ego: {},
  formEnabled: jest.fn(),
  submitForm: jest.fn(),
  updateEgo: jest.fn(),
};

describe('EgoForm', () => {
  it('renders EgoForm interface', () => {
    const component = shallow(<EgoForm {...requiredProps} />);
    expect(component.find('Connect(AutoInitialisedForm)')).toHaveLength(1);
    expect(component.find('.progress-container')).toHaveLength(1);
    expect(component.find('.progress-container--show')).toHaveLength(0);
    expect(component.find('.progress-container__status-text')).toHaveLength(0);
  });

  it('renders progress', () => {
    const component = shallow(<EgoForm {...requiredProps} />);
    component.setState({ scrollProgress: 1 });
    expect(component.find('.progress-container--show')).toHaveLength(1);
    expect(component.find('.progress-container__status-text')).toHaveLength(1);
  });
});

/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { AlterForm } from '../AlterForm';

const requiredProps = {
  form: {
    title: 'alpha',
    entity: 'node',
    type: 'person',
  },
  stageNodes: [{ name: 'One' }, { name: 'Two' }],
  stage: { introductionPanel: { title: 'intro', text: 'content' } },
  formEnabled: jest.fn(),
  submitForm: jest.fn(),
  updateNode: jest.fn(),
};

describe('AlterForm', () => {
  it('renders AlterForm interface', () => {
    const component = shallow(<AlterForm {...requiredProps} />);
    expect(component.find('.swiper-no-swiping')).toHaveLength(1);
    expect(component.find('ReactIdSwiper')).toHaveLength(1);
    expect(component.find('.progress-container')).toHaveLength(1);
    expect(component.find('.progress-container--show')).toHaveLength(0);
  });

  it('renders progress', () => {
    const component = shallow(<AlterForm {...requiredProps} />);
    component.setState({ activeIndex: 1 });
    expect(component.find('.progress-container--show')).toHaveLength(1);
  });
});

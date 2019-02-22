/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { AlterEdgeForm } from '../AlterEdgeForm';

const requiredProps = {
  form: {
    title: 'alpha',
    entity: 'edge',
    type: 'friend',
  },
  stageEdges: [{ name: 'One' }, { name: 'Two' }],
  stage: { introductionPanel: { title: 'intro', text: 'content' } },
  formEnabled: jest.fn(),
  submitForm: jest.fn(),
  updateEdge: jest.fn(),
};

describe('AlterEdgeForm', () => {
  it('renders AlterEdgeForm interface', () => {
    const component = shallow(<AlterEdgeForm {...requiredProps} />);
    expect(component.find('.swiper-no-swiping')).toHaveLength(1);
    expect(component.find('ReactIdSwiper')).toHaveLength(1);
    expect(component.find('.progress-container')).toHaveLength(1);
    expect(component.find('.progress-container--show')).toHaveLength(0);
  });

  it('renders progress', () => {
    const component = shallow(<AlterEdgeForm {...requiredProps} />);
    component.setState({ activeIndex: 1 });
    expect(component.find('.progress-container--show')).toHaveLength(1);
  });
});

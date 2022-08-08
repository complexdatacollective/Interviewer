/* eslint-env jest */


import React from 'react';
import { shallow } from 'enzyme';
import { UnconnectedCategoricalItem as CategoricalItem } from '../CategoricalItem';

describe('CategoricalItem component', () => {
  it('renders unexpanded categorical item', () => {
    const component = shallow(
      <CategoricalItem />,
    );

    expect(component).toMatchSnapshot();

    expect(component.find('.categorical-item').at(0).hasClass('categorical-item--expanded')).toBe(false);
    expect(component.find('.categorical-item__content')).toHaveLength(0);
  });

  it('renders expanded categorical item', () => {
    const component = shallow(
      <CategoricalItem isExpanded />,
    );

    expect(component.find('.categorical-item').at(0).hasClass('categorical-item--expanded')).toBe(true);
    expect(component.find('.categorical-item__content')).toHaveLength(1);
  });

  it('registers click', () => {
    const clickDummy = jest.fn();

    const component = shallow(
      <CategoricalItem onClick={clickDummy} />,
    );

    expect(clickDummy.mock.calls.length).toBe(0);
    component.find('.categorical-item').simulate('click');
    expect(clickDummy.mock.calls.length).toBe(1);
  });
});

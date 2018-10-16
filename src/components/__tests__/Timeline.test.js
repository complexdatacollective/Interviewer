/* eslint-env jest */

import React from 'react';
import { mount } from 'enzyme';
import { Timeline } from '../Timeline';


describe('Timeline component', () => {
  const toggleMock = jest.fn();
  const backMock = jest.fn();
  const nextMock = jest.fn();

  const component = mount(
    <Timeline
      percentProgress="40"
      onClickBack={backMock}
      onClickNext={nextMock}
      toggleMenu={toggleMock}
    />,
  );

  it('toggles menu on timeline click', () => {
    expect(toggleMock.mock.calls.length).toBe(0);
    component.find('.progress-bar').simulate('click');
    expect(toggleMock.mock.calls.length).toBe(1);
  });

  it('calls back function on clicking back button', () => {
    expect(backMock.mock.calls.length).toBe(0);
    component.find('Icon').at(0).simulate('click');
    expect(backMock.mock.calls.length).toBe(1);
  });

  it('calls next function on clicking next button', () => {
    expect(nextMock.mock.calls.length).toBe(0);
    component.find('.timeline-nav--next').simulate('click');
    expect(nextMock.mock.calls.length).toBe(1);
  });
});

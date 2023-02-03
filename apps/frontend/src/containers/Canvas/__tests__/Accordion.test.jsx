/* eslint-env jest */

import React from 'react';
import { shallow } from 'enzyme';

import Accordion from '../Accordion';

describe('Accordion', () => {
  it('calls a handler when anything clicked', () => {
    // "Toggle" here has nothing to do with accordion open state
    const handler = jest.fn();
    const subject = shallow(<Accordion onAccordionToggle={handler} />);
    subject.simulate('click');
    expect(handler).toHaveBeenCalled();
  });

  it('toggles its own open state when header clicked', () => {
    const onToggle = jest.fn();
    const subject = shallow(<Accordion onAccordionToggle={onToggle} />);
    const openState = subject.state('open');
    subject.find('.accordion__toggle').simulate('click');
    expect(subject.state('open')).not.toEqual(openState);
  });
});

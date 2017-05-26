/* eslint-env jest */

import React from 'react';
import { shallow } from 'enzyme';
import Modal from '../../Elements/Modal';

describe('Modal component', () => {
  describe('show is false', () => {
    it('renders nothing', () => {
      const component = shallow((
        <Modal title="foo" show={false} onClose={() => {}}>
          foo
        </Modal>
      ));

      expect(component.get(0)).toBe(null);
    });
  });

  describe('show is true', () => {
    it('renders with content', () => {
      const component = shallow((
        <Modal title="foo" show onClose={() => {}}>
          <span>foo</span>
        </Modal>
      ));

      expect(component.contains(<span>foo</span>)).toBe(true);
    });

    it('calls onClose when close event is triggered', () => {
      const onClose = jest.fn();
      const component = shallow(<Modal title="foo" show onClose={onClose} />);

      expect(onClose.mock.calls.length).toBe(0);

      // Click on close button
      component.find('button').simulate('click');
      expect(onClose.mock.calls.length).toBe(1);

      // Click on background
      component.find('.modal').simulate('click');
      expect(onClose.mock.calls.length).toBe(2);

      // Clicks to window shouldn't trigger it
      component.find('.modal__window').simulate('click', { stopPropagation: () => {} });
      expect(onClose.mock.calls.length).toBe(2);
    });
  });
});

/* eslint-env jest */

import React from 'react';
import { shallow } from 'enzyme';
import Modal from '../../Elements/Modal';

describe('Modal component', () => {
  describe('show is false', () => {
    it('renders nothing', () => {
      const component = shallow(
        <Modal show={ false }>
          foo
        </Modal>
      );

      expect(component.get(0)).toBe(null);
    });
  });

  describe('show is true', () => {
    it('renders with content', () => {
      const component = shallow(
        <Modal show={ true }>
          <span>foo</span>
        </Modal>
      );

      expect(component.contains(<span>foo</span>)).toBe(true);
    });

  });
});

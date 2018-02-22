/* eslint-env jest */

import React from 'react';
import { shallow } from 'enzyme';
import Dialog from '../Dialog';

const testProps = {
  title: '',
  type: '',
  name: '',
  confirmLabel: '',
  onConfirm: () => {},
};

describe('<Dialog /> component', () => {
  it('can render', () => {
    const component = shallow(
      <Dialog {...testProps} />,
    );

    expect(component).toMatchSnapshot();
  });

  describe('cancel button', () => {
    it('no cancel button renders by default', () => {
      const component = shallow(
        <Dialog {...testProps} />,
      );

      expect(component.find('.dialog__footer Button').length).toEqual(1);
    });

    it('when hasCancelButton is true, cancel button renders', () => {
      const component = shallow(
        <Dialog {...{ ...testProps, hasCancelButton: true }} />,
      );

      expect(component.find('.dialog__footer Button').length).toEqual(2);
    });
  });

  describe('additional information', () => {
    it('no additional information renders by default', () => {
      const component = shallow(
        <Dialog {...testProps} />,
      );

      expect(component.find('.dialog__additional-content').length).toEqual(0);
    });

    it('when additional information is set, it renders', () => {
      const component = shallow(
        <Dialog {...{ ...testProps, additionalInformation: 'test' }} />,
      );

      expect(component.find('.dialog__additional-content').length).toEqual(1);
    });
  });
});

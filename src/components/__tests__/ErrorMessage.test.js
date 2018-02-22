/* eslint-env jest */

import React from 'react';
import { shallow } from 'enzyme';
import { ErrorMessage } from '../ErrorMessage';

jest.mock('../../ducks/modules/protocol');

const mockProps = {
  error: null,
  acknowledged: true,
  acknowledgeError: () => {},
};

describe('<ErrorMessage />', () => {
  it('can render', () => {
    const component = shallow(
      <ErrorMessage {...mockProps} />,
    );

    expect(component).toMatchSnapshot();
  });

  describe('show', () => {
    const testProps = {
      ...mockProps,
      error: new Error('there was an error'),
      acknowledged: false,
    };

    it('when error and acknowledge, show is true', () => {
      const component = shallow(
        <ErrorMessage {...testProps} />,
      );

      expect(component.find('Dialog').prop('show')).toEqual(true);
    });
    it('when no error, show is false', () => {
      const component = shallow(
        <ErrorMessage {...{ ...testProps, error: null }} />,
      );

      expect(component.find('Dialog').prop('show')).toEqual(false);
    });

    it('when acknowleged, show is false', () => {
      const component = shallow(
        <ErrorMessage {...{ ...testProps, acknowledged: true }} />,
      );

      expect(component.find('Dialog').prop('show')).toEqual(false);
    });
  });
});

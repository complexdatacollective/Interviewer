/* eslint-env jest */

import React from 'react';
import { createStore } from 'redux';
import { mount } from 'enzyme';

import StatsPanel from '../StatsPanel';

import { actionCreators as sessionActions } from '../../../ducks/modules/session';
import { actionCreators as uiActions } from '../../../ducks/modules/ui';

jest.mock('../../../ducks/modules/session');
jest.mock('../../../ducks/modules/ui');

describe('StatsPanel container', () => {
  describe('onFinishInterview', () => {
    beforeEach(() => {
      sessionActions.endSession.mockReturnValue({ type: 'mock' });
      uiActions.update.mockReturnValue({ type: 'mock' });
    });

    it('ends a session', () => {
      const subject = mount(<StatsPanel store={createStore(() => ({}))} />);
      subject.find('StatsPanel').prop('onFinishInterview')({});
      expect(sessionActions.endSession).toHaveBeenCalled();
      expect(uiActions.update).toHaveBeenCalled();
    });
  });
});

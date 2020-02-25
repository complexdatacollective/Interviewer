/* eslint-env jest */

import React from 'react';
import { shallow } from 'enzyme';

import MainMenu from '../MainMenu';

jest.mock('../../../containers/MainMenu/StagesMenu');
jest.mock('../../../containers/MainMenu/SettingsMenu');

describe('MainMenu component', () => {
  let subject;
  let settingsMenu;
  let stagesMenu;
  beforeEach(() => {
    const props = {
      sessionLoaded: true,
      handleCloseMenu: jest.fn(),
      handleReturnToStart: jest.fn(),
    };
    subject = shallow(<MainMenu {...props} />);
    settingsMenu = subject.find('Connect(withHandlers(SettingsMenu))');
    stagesMenu = subject.find('Connect(StagesMenu)');
  });

  it('defaults to showing stages', () => {
    expect(subject.state('activePanel')).toEqual('stages');
  });

  it('activates Settings on click', () => {
    settingsMenu.prop('onClickInactive')();
    expect(subject.state('activePanel')).toEqual('settings');
  });

  it('activates Stages on click', () => {
    subject.setState({ activePanel: 'settings' });
    stagesMenu.prop('onClickInactive')();
    expect(subject.state('activePanel')).toEqual('stages');
  });
});

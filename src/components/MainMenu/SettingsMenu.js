import React from 'react';
import PropTypes from 'prop-types';
import { Icon, Button } from '../../ui/components';
import Scroller from '../Scroller';
import { Toggle, Text } from '../../ui/components/Fields';
import MenuPanel from './MenuPanel';

const SettingsMenu = ({
  active,
  onClickInactive,
  handleAddMockNodes,
  handleResetAppData,
  toggleUseFullScreenForms,
  useFullScreenForms,
  toggleUseDynamicScaling,
  useDynamicScaling,
  setDeviceDescription,
  deviceDescription,
  setInterfaceScale,
  interfaceScale,
}) => (
  <MenuPanel
    active={active}
    panel="settings"
    onClickInactive={onClickInactive}
  >
    <Icon name="settings" />
    <div className="main-menu-settings-menu">
      <div className="main-menu-settings-menu__header">
        <h1>Settings</h1>
      </div>
      <Scroller>
        <div className="main-menu-settings-menu__form">
          <fieldset>
            <legend>Developer Options</legend>
            <section>
              <p>The device name determines how your device appears to Server.</p>
              <Text
                input={{
                  defaultValue: deviceDescription,
                  onChange: e => setDeviceDescription(e.target.value),
                }}
                label="Device name"
                fieldLabel=" "
              />
            </section>
            <section>
              <p>During an active interview session, clicking this button will create mock nodes for
              testing purposes.</p>
              <Button
                color="mustard"
                onClick={handleAddMockNodes}
              >
                Add mock nodes
              </Button>
            </section>
            <section>
              <p>Use the button below to reset all Network Canvas data. This will erase any
                in-progress interviews, and all application settings.</p>
              <Button
                color="mustard"
                onClick={handleResetAppData}
              >
                Reset Network Canvas data
              </Button>
            </section>
          </fieldset>
          <fieldset>
            <legend>Display Settings</legend>
            <section>
              <p>
                The full screen form is optomised for smaller devices, or devices with no physical
                keyboard.
              </p>
              <Toggle
                input={{
                  checked: true,
                  value: useFullScreenForms,
                  onChange: toggleUseFullScreenForms,
                }}
                label="Use full screen form?"
                fieldLabel=" "
              />
            </section>
            <section>
              <p>
                Dynamic scaling lets Network Canvas resize the user interface proportionally to the
                size of the window.
              </p>
              <Toggle
                input={{
                  checked: true,
                  value: useDynamicScaling,
                  onChange: toggleUseDynamicScaling,
                }}
                label="Use dynamic scaling?"
                fieldLabel=" "
              />
            </section>
            <section>
              <p>
                This setting allows you to control the size of the Network Canvas user interface
              </p>
              <label htmlFor="scaleFactor">Interface Scale</label>
              <input
                type="range"
                name="scaleFactor"
                min="80"
                max="130"
                value={interfaceScale}
                onChange={(e) => { setInterfaceScale(parseInt(e.target.value, 10)); }}
                step="5"
              />
            </section>
          </fieldset>
        </div>
      </Scroller>
    </div>
  </MenuPanel>
);

SettingsMenu.propTypes = {
  active: PropTypes.bool,
  onClickInactive: PropTypes.func,
  handleResetAppData: PropTypes.func.isRequired,
  handleAddMockNodes: PropTypes.func.isRequired,
  toggleUseFullScreenForms: PropTypes.func.isRequired,
  useFullScreenForms: PropTypes.bool.isRequired,
  toggleUseDynamicScaling: PropTypes.func.isRequired,
  useDynamicScaling: PropTypes.bool.isRequired,
  setDeviceDescription: PropTypes.func.isRequired,
  deviceDescription: PropTypes.string.isRequired,
  setInterfaceScale: PropTypes.func.isRequired,
  interfaceScale: PropTypes.number.isRequired,

};

SettingsMenu.defaultProps = {
  active: false,
  onClickInactive: () => {},
};

export default SettingsMenu;

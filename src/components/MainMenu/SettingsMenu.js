import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Icon, Button } from '../../ui/components';
import Scroller from '../Scroller';
import { Toggle, Text } from '../../ui/components/Fields';
import MenuPanel from './MenuPanel';

class SettingsMenu extends PureComponent {
  render() {
    const {
      active,
      onClickInactive,
      handleAddMockNodes,
      handleResetAppData,
      importProtocolFromURI,
      toggleUseFullScreenForms,
      useFullScreenForms,
      shouldShowMocksItem,
      toggleUseDynamicScaling,
      useDynamicScaling,
      setDeviceDescription,
      deviceDescription,
      setInterfaceScale,
      interfaceScale,
    } = this.props;
    return (
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
                      value: deviceDescription,
                      onChange: e => setDeviceDescription(e.target.value),
                    }}
                    label="Device name"
                    fieldLabel=" "
                  />
                </section>
                {
                  shouldShowMocksItem &&
                  <section>
                    <p>
                      During an active interview session, clicking this button will create
                      mock nodes for testing purposes.
                    </p>
                    <Button
                      color="mustard"
                      onClick={handleAddMockNodes}
                    >
                      Add mock nodes
                    </Button>
                  </section>
                }
                <section>
                  <p>
                    Use the button below to reset all Network Canvas data. This will erase any
                    in-progress interviews, and all application settings.
                  </p>
                  <Button
                    color="mustard"
                    onClick={handleResetAppData}
                  >
                    Reset Network Canvas data
                  </Button>
                </section>
                <section>
                  <p>
                    The button below will import the latest development protocol for this version
                    of Network Canvas.
                  </p>
                  <Button
                    color="mustard"
                    onClick={() => importProtocolFromURI('https://github.com/codaco/development-protocol/releases/download/20190410122751-7141c7a/development-protocol.netcanvas')}
                  >
                    Import development protocol
                  </Button>
                </section>
              </fieldset>
              <fieldset>
                <legend>Display Settings</legend>
                <section>
                  <p>
                    This setting allows you to control the size of the Network Canvas user
                    interface. Increasing the interface size may limit the amount of information
                    visible on each screen.
                  </p>
                  <label htmlFor="scaleFactor">Interface Scale</label>
                  <input
                    type="range"
                    name="scaleFactor"
                    min="80"
                    max="120"
                    value={interfaceScale}
                    onChange={(e) => { setInterfaceScale(parseInt(e.target.value, 10)); }}
                    step="5"
                  />
                </section>
                <section>
                  <p>
                    Dynamic scaling lets Network Canvas resize the user interface proportionally to
                    the size of the window. Turning it off will use a fixed size.
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
                    The full screen node form is optimized for smaller devices, or devices with
                    no physical keyboard.
                  </p>
                  <Toggle
                    input={{
                      checked: true,
                      value: useFullScreenForms,
                      onChange: toggleUseFullScreenForms,
                    }}
                    label="Use full screen node form?"
                    fieldLabel=" "
                  />
                </section>
              </fieldset>
            </div>
          </Scroller>
        </div>
      </MenuPanel>
    );
  }
}

SettingsMenu.propTypes = {
  active: PropTypes.bool,
  onClickInactive: PropTypes.func,
  handleResetAppData: PropTypes.func.isRequired,
  importProtocolFromURI: PropTypes.func.isRequired,
  handleAddMockNodes: PropTypes.func.isRequired,
  shouldShowMocksItem: PropTypes.bool,
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
  shouldShowMocksItem: false,
};

export default SettingsMenu;

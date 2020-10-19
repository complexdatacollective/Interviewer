import React from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { motion } from 'framer-motion';
import { Toggle } from '@codaco/ui/lib/components/Fields';
import { isElectron, isCordova, isIOS } from '../../../utils/Environment';
import { actionCreators as deviceSettingsActions } from '../../../ducks/modules/deviceSettings';
import TabItemVariants from './TabItemVariants';


const VisualPreferences = (props) => {
  const {
    useDynamicScaling,
    showScrollbars,
    startFullScreen,
    useFullScreenForms,
    showGettingStarted,
    toggleSetting,
    setInterfaceScale,
    interfaceScale,
  } = props;

  const getElectronWindow = () => {
    if (isElectron()) {
      const electron = window.require('electron');
      return electron.remote.getCurrentWindow();
    }
    return false;
  };

  const handleToggleUseFullScreenApp = () => {
    const electronWindow = getElectronWindow();

    if (electronWindow) {
      if (electronWindow.isFullScreen()) {
        electronWindow.setFullScreen(false);
      } else {
        electronWindow.setFullScreen(true);
      }
    }

    toggleSetting('startFullScreen');
  };

  return (
    <React.Fragment>
      <motion.article variants={TabItemVariants} className="settings-element">
        <Toggle
          input={{
            checked: true,
            value: showGettingStarted,
            onChange: () => toggleSetting('showGettingStarted'),
          }}
        />
        <div>
          <h2>Show &quot;getting started&quot; card?</h2>
          <p>
            This card provides links to useful resources when you open the app for the first
            time.
          </p>
        </div>
      </motion.article>
      <motion.article variants={TabItemVariants} className="settings-element">
        <div className="form-field-container">
          <div className="form-field">
            <select
              name="scaleFactor"
              className="select-css"
              value={interfaceScale}
              onChange={(e) => { setInterfaceScale(parseInt(e.target.value, 10)); }}
            >
              <option value="80">80%</option>
              <option value="90">90%</option>
              <option value="95">95%</option>
              <option value="100">100%</option>
              <option value="105">105%</option>
              <option value="110">110%</option>
              <option value="115">115%</option>
              <option value="120">120%</option>
              <option value="130">130%</option>
            </select>
          </div>
        </div>
        <div>
          <h2>Interface Scale</h2>
          <p>
            This setting allows you to control the size of the Network Canvas user
            interface. Increasing the interface size may limit the amount of information
            visible on each screen.
          </p>
        </div>
      </motion.article>
      {!isCordova() && <motion.article variants={TabItemVariants} className="settings-element">
        <Toggle
          input={{
            checked: true,
            value: useDynamicScaling,
            onChange: () => toggleSetting('useDynamicScaling'),
          }}
        />
        <div>
          <h2>Use dynamic scaling?</h2>
          <p>
            Dynamic scaling lets Network Canvas resize the user interface proportionally to
            the size of the window. Turning it off will use a fixed size.
          </p>
        </div>
      </motion.article>
      }
      {!isIOS() && <motion.article variants={TabItemVariants} className="settings-element">
        <Toggle
          input={{
            checked: false,
            value: showScrollbars,
            onChange: () => toggleSetting('showScrollbars'),
          }}
        />
        <div>
          <h2>Show Scrollbars?</h2>
          <p>
            By default, Network Canvas does not show scrollbars in order to provide
            a more streamlined visual experience. If you encounter difficulties with
            discoverability or with scrolling behavior, you may enable showing scrollbars
            here.
          </p>
        </div>
      </motion.article>
      }
      {isElectron() && <motion.article variants={TabItemVariants} className="settings-element">
        <Toggle
          input={{
            checked: !!startFullScreen,
            value: startFullScreen,
            onChange: handleToggleUseFullScreenApp,
          }}
        />
        <div>
          <h2>Run Fullscreen?</h2>
          <p>
            Network Canvas is designed to run in full screen mode for an
            immersive experience. You may disable or enable this mode here.
          </p>
          <p>
            <em><strong>Windows users:</strong> when in full screen mode you
              can access the native app menu by pressing the <code>alt</code> key.</em>
          </p>
        </div>
      </motion.article>}
      <motion.article variants={TabItemVariants} className="settings-element">
        <Toggle
          input={{
            checked: true,
            value: useFullScreenForms,
            onChange: () => toggleSetting('useFullScreenForms'),
          }}
        />
        <div>
          <h2>Use fullscreen forms?</h2>
          <p>
            The full screen node form is optimized for smaller devices, or devices with
            no physical keyboard.
          </p>
        </div>
      </motion.article>
    </React.Fragment>
  );
};


const mapDispatchToProps = dispatch => ({
  toggleSetting: settingName => dispatch(deviceSettingsActions.toggleSetting(settingName)),
  setInterfaceScale: scale => dispatch(deviceSettingsActions.setInterfaceScale(scale)),
});

const mapStateToProps = state => ({
  useFullScreenForms: state.deviceSettings.useFullScreenForms,
  useDynamicScaling: state.deviceSettings.useDynamicScaling,
  showScrollbars: state.deviceSettings.showScrollbars,
  startFullScreen: state.deviceSettings.startFullScreen,
  showGettingStarted: state.deviceSettings.showGettingStarted,
  interfaceScale: state.deviceSettings.interfaceScale,
});

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
)(VisualPreferences);

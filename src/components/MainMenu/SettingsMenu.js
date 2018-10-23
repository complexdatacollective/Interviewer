import React from 'react';
import PropTypes from 'prop-types';
import { Icon, Button } from '../../ui/components';
import Scroller from '../Scroller';
import { Toggle, Text } from '../../ui/components/Fields';
import MenuPanel from './MenuPanel';

/* eslint-disable */
var optimizedResize = (function() {

  var callbacks = [],
      running = false;

  // fired on resize event
  function resize() {

      if (!running) {
          running = true;

          if (window.requestAnimationFrame) {
              window.requestAnimationFrame(runCallbacks);
          } else {
              setTimeout(runCallbacks, 66);
          }
      }

  }

  // run the actual callbacks
  function runCallbacks() {

      callbacks.forEach(function(callback) {
          callback();
      });

      running = false;
  }

  // adds callback to loop
  function addCallback(callback) {

      if (callback) {
          callbacks.push(callback);
      }

  }

  return {
      // public method to add additional callback
      add: function(callback) {
          if (!callbacks.length) {
              window.addEventListener('resize', resize);
          }
          addCallback(callback);
      }
  }
}());

// start process
optimizedResize.add(() => {
  setFontSize();
});


function vh(v) {
  var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
  return (v * h) / 100;
}

function vw(v) {
  var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
  return (v * w) / 100;
}

function vmin(v) {
  return Math.min(vh(v), vw(v));
}

window.scaleFactor = 100;

const setFontSize = () => {
  let root = document.documentElement;

  window.initialWidth = window.outerWidth;
  window.initialHeight = window.outerHeight;

  let adjustedScale = window.scaleFactor/ 1.2;
  let newFontSize = window.initialWidth / adjustedScale;
  console.log('Resize', adjustedScale, newFontSize);

  root.style.setProperty('--base-font-size', newFontSize + "px");
}

setFontSize();

/* eslint-enable */
const SettingsMenu = ({
  active,
  onClickInactive,
  handleAddMockNodes,
  handleResetAppData,
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
                  defaultValue: 'Unknown device',
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
                  value: true,
                  onChange: () => {},
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
                  value: true,
                  onChange: () => {},
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
                min="50"
                max="150"
                defaultValue="100"
                onChange={(e) => { console.log(e); }}
                step="10"
                list="tickmarks"
              />
              <datalist id="tickmarks">
                <option>50</option>
                <option>60</option>
                <option>70</option>
                <option>80</option>
                <option>90</option>
                <option>100</option>
                <option>110</option>
                <option>120</option>
                <option>130</option>
                <option>140</option>
                <option>150</option>
              </datalist>
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
};

SettingsMenu.defaultProps = {
  active: false,
  onClickInactive: () => {},
};

export default SettingsMenu;

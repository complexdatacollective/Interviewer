import React, { Component } from 'react';
import cx from 'classnames';
import { Button, Icon } from '../../ui/components';
import { Scroller } from '../../components';


class MenuContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activePanel: 'stages',
    };

    this.toggleActivePanel = this.toggleActivePanel.bind(this);
  }

  toggleActivePanel() {
    const activePanel = this.state.activePanel === 'settings' ? 'stages' : 'settings';
    this.setState({ activePanel });
  }

  render() {
    return (
      <div className="menu-container">
        <div className="menu-container__content">
          <div className="menu-container__header">
            <Icon name="close" />
          </div>
          <div className="menu-container__panels">
            <div className="menu-panels">
              <div
                className={cx({
                  'menu-panel': true,
                  'menu-panel__settings': true,
                  active: this.state.activePanel === 'settings',
                })}
                onClick={this.toggleActivePanel}
              >
                <Icon name="settings" />
              </div>
              <div
                className={cx({
                  'menu-panel': true,
                  'menu-panel__stages': true,
                  active: this.state.activePanel === 'stages',
                })}
                onClick={this.toggleActivePanel}
              >
                <div className="stages-menu">
                  <div className="stages-menu__timeline">
                    <div className="stages-timeline__header">
                      <h1>Interview Stages</h1>
                      <input type="text" placeholder="yo" />
                    </div>
                    <div className="stages-timeline__timeline">
                      <Scroller>
                        <div className="timeline-stage">
                          <div className="timeline-stage__notch" />
                          <div className="timeline-stage__edit-stage">
                            <div className="timeline-stage__edit-stage-title">Namegen1</div>
                            <div className="timeline-stage__screen">
                              <div className="timeline-stage__screen-preview">
                                <img
                                  src="./static/media/stage--NameGenerator.bf159d05.png"
                                  alt="NameGenerator Interface"
                                  title="NameGenerator Interface"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </Scroller>
                    </div>
                  </div>
                  <div className="stages-menu__stats">
                    <h4>Session Information</h4>
                    <Button>Finish Interview</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="menu-container__footer">
            <Button>Return to start screen</Button>
          </div>
        </div>
      </div>
    );
  }
}

export default MenuContainer;

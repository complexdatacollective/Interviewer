import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import cx from 'classnames';
import { sessionMenuIsOpen, stageMenuIsOpen } from '../selectors/session';
import { SessionMenu, StageMenu } from '.';
import { Dialog } from '../containers/Elements';
import getVersion from '../utils/getVersion';
import updater from '../utils/updater';
import {
  actionCreators as modalActions,
  modalNames as modals,
} from '../ducks/modules/modals';


require('../styles/main.scss');

/**
  * Main app container.
  * @param props {object} - children
  */
class App extends Component {

  constructor() {
    super();

    this.state = {
      version: '0.0.0',
    };
  }

  componentWillMount() {
    getVersion().then((version) => {
      this.setState({
        version,
      });
    });

    // Initialise the update checker. Returns a promise that resolves based
    // on the outcome.
    updater.checkForUpdate().then(
      (response) => {
        // Update available.
        console.log('SUCCESS LAND ', response);
        this.props.openModal(modals.UPDATE_AVAILABLE);
      },
      (failure) => {
        // No update available.
        console.log('FAILURE LAND ', failure);
        this.props.openModal(modals.NO_UPDATES_DIALOG);
      },
    ).catch(
      // Error checking for updates
      (error) => {
        console.log('ERROR LAND ', error);
      },
    );
  }

  render() {
    const { isSessionMenu, isMenuOpen, children } = this.props;
    const { version } = this.state;

    return (
      <div className={cx({
        app: true,
        'app--session': isSessionMenu,
      })}
      >
        <div style={{ position: 'absolute', top: 0, right: 0, display: 'inline', padding: '10px', zIndex: 1000 }}>{ version }</div>
        <SessionMenu hideButton={isMenuOpen} />
        <StageMenu hideButton={isMenuOpen} />
        <div
          id="page-wrap"
          className={cx({
            app__content: true,
            'app__content--pushed': isMenuOpen,
          })}
        >
          <Dialog
            name={modals.UPDATE_AVAILABLE}
            title="Update available."
            type="info"
            confirmLabel="Download"
            onConfirm={() => {
              updater.downloadUpdate().then(
                (response) => {
                  // Update downloaded
                  console.log('UPDATE DOWNLOAD SUCCESS', response);
                  this.props.openModal(modals.UPDATE_INSTALL_DIALOG);
                },
                (failure) => {
                  // Update didn't download
                  console.log('UPDATE DOWNLOAD FAILURE ', failure);
                  this.props.openModal(modals.UPDATE_ERROR_DIALOG);
                },
              ).catch(
                // Error downloading update
                (error) => {
                  console.log('Download update error ', error);
                  this.props.openModal(modals.UPDATE_ERROR_DIALOG);
                },
              );
            }
            }
          >
            <p>
              A new version of Network Canvas is available to download.
              Would you like to download and install it now?
            </p>
            <p>
              <strong>Please note: </strong>
              installing the update will require you to restart Network Canvas.
            </p>
          </Dialog>
          <Dialog
            name={modals.NO_UPDATES_DIALOG}
            title="No updates available at this time."
            type="info"
            confirmLabel="Okay"
            hasCancelButton={false}
          >
            <p>
              You are using the latest available version of Network Canvas.
            </p>
          </Dialog>
          <Dialog
            name={modals.UPDATE_INSTALL_DIALOG}
            title="Update ready to install."
            type="warning"
            confirmLabel="Install Now"
            onConfirm={() => { updater.installUpdate(); }}
          >
            <p>
              Your update is ready to install. Network Canvas will now
              close, and will reopen once the update is configured. Make sure
              you have saved any data within the app before continuing.
            </p>
          </Dialog>
          <Dialog
            name={modals.UPDATE_ERROR_DIALOG}
            title="Error encountered during update."
            type="error"
            confirmLabel="Okay"
            hasCancelButton={false}
          >
            <p>
              An error has occured during the update process.
            </p>
          </Dialog>
          { children }
        </div>
      </div>
    );
  }
}

App.propTypes = {
  children: PropTypes.any,
  isMenuOpen: PropTypes.bool,
  isSessionMenu: PropTypes.bool,
  openModal: PropTypes.func.isRequired,
};

App.defaultProps = {
  children: null,
  isMenuOpen: false,
  isSessionMenu: false,
};

function mapDispatchToProps(dispatch) {
  return {
    closeModal: bindActionCreators(modalActions.closeModal, dispatch),
    openModal: bindActionCreators(modalActions.openModal, dispatch),
  };
}

function mapStateToProps(state) {
  return {
    isMenuOpen: sessionMenuIsOpen(state) || stageMenuIsOpen(state),
    isSessionMenu: sessionMenuIsOpen(state),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(App);

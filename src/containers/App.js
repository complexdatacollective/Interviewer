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
import { actionCreators as modalActions } from '../ducks/modules/modals';


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
      updateDialog: {
        title: 'Update Dialog',
        type: 'info',
        additionalInformation: '',
        content: null,
        onConfirm: () => {},
        confirmLabel: 'Continue',
        hasCancelButton: false,
      },
    };
  }

  componentWillMount() {
    getVersion().then((version) => {
      this.setState(...this.state, {
        version,
      });
    });

    // Initialise the update checker. Returns a promise.
    updater.checkForUpdate().then(
      (response) => {
        // Update available.
        const version = response.version.toString();
        const releaseNotes = response.releaseNotes.toString();
        this.setState(...this.state, {
          updateDialog: {
            title: `Version ${version} is Available`,
            type: 'info',
            content: `Version ${version} of Network Canvas is available to download. You are currently using ${this.state.version}. Would you like to download it now?`,
            additionalInformation: releaseNotes,
            onConfirm: () => { this.confirmUpdateDownload(); },
            confirmLabel: 'Download now',
            hasCancelButton: true,
          },
        }, () => {
          this.props.openModal('UPDATE_DIALOG');
        });
      },
      (failure) => {
        // No update available, or error.
        if (failure instanceof Error) {
          throw new Error(failure.message);
        }
        // No update available.
        this.setState(...this.state, {
          updateDialog: {
            title: 'No Updates Availble',
            type: 'info',
            content: 'The update process failed.',
            additionalInformation: failure,
            onConfirm: () => {},
            confirmLabel: 'Okay',
            hasCancelButton: false,
          },
        }, () => {
          this.props.openModal('UPDATE_DIALOG');
        });
      },
    ).catch(
      // Error while checking for updates
      (error) => {
        this.setState(...this.state, {
          updateDialog: {
            title: 'An Error Occured',
            type: 'error',
            content: 'An error has occured while checking for an update. More information to help diagnose the issue can be found below.',
            additionalInformation: error,
            onConfirm: () => {},
            confirmLabel: 'Okay',
            hasCancelButton: false,
          },
        }, () => {
          this.props.openModal('UPDATE_DIALOG');
        });
      },
    );
  }

  // User clicked download Button
  // TODO: implement progress updates/loader
  confirmUpdateDownload() {
    // Trigger the download. Returns promise.
    updater.downloadUpdate().then(
      // Update downloaded
      () => {
        this.setState(...this.state, {
          updateDialog: {
            title: 'Update Ready to Install',
            type: 'warning',
            additionalInformation: '',
            content: 'Your update is ready to install. Network Canvas will now close, and will reopen once the update is configured. Make sure you have saved any data within the app before continuing.',
            onConfirm: () => { updater.installUpdate(); },
            confirmLabel: 'Install and Restart',
            hasCancelButton: true,
          },
        }, () => {
          this.props.openModal('UPDATE_DIALOG');
        });
      },
      // Update failed to download. Either cancelled or errored.
      (failure) => {
        // Test for error
        if (failure instanceof Error) {
          throw new Error(failure.message);
        }
        // Otherwise assumed cancelled.
        this.setState(...this.state, {
          updateDialog: {
            title: 'Error Encountered During Update',
            type: 'error',
            additionalInformation: '',
            content: 'An error has occured during the update process.',
            onConfirm: () => {},
            confirmLabel: 'Okay',
            hasCancelButton: false,
          },
        }, () => {
          this.props.openModal('UPDATE_DIALOG');
        });
      },
    ).catch(
      // Error while downloading update
      (error) => {
        this.setState(...this.state, {
          updateDialog: {
            title: 'An Error Occured',
            type: 'error',
            content: 'An error has occured during the update process. More information to help diagnose the issue can be found below.',
            additionalInformation: error,
            onConfirm: () => {},
            confirmLabel: 'Okay',
            hasCancelButton: false,
          },
        });
        // This shouldn't be here. But setState is async. How to handle better?
        setTimeout(() => {
          this.props.openModal('UPDATE_DIALOG');
        }, 1000);
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
            name="UPDATE_DIALOG"
            title={this.state.updateDialog.title}
            type={this.state.updateDialog.type}
            confirmLabel={this.state.updateDialog.confirmLabel}
            hasCancelButton={this.state.updateDialog.hasCancelButton}
            additionalInformation={this.state.updateDialog.additionalInformation}
            onConfirm={this.state.updateDialog.onConfirm}
          >
            {this.state.updateDialog.content}
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

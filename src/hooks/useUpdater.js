/* eslint-disable no-nested-ternary */
import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Button } from '@codaco/ui';
import { find } from 'lodash';
import compareVersions from 'compare-versions';
import ReactMarkdown from 'react-markdown';
import { actionCreators as toastActions } from '../ducks/modules/toasts';
import { actionCreators as dialogActions } from '../ducks/modules/dialogs';
import getVersion from '../utils/getVersion';
import ExternalLink, { openExternalLink } from '../components/ExternalLink';
import { isCordova, isIOS, isMacOS, isWindows } from '../utils/Environment';
import useDismissedUpdatesState from './useDismissedUpdatesState';


const useUpdater = (updateURL) => {
  const dispatch = useDispatch();
  const [dismissedVersion, setDismissedVersion] = useDismissedUpdatesState('dismissedVersion');

  const showReleaseNotes = (message, assets) => {
    const renderers = {
      link: ({ children, href }) => <ExternalLink href={href}>{children}</ExternalLink>,
    };

    const openPlatformAsssetURL = () => {
      dispatch(toastActions.removeToast('update-toast'));

      if (isIOS()) {
        return openExternalLink('https://apps.apple.com/us/app/network-canvas-interviewer/id1538673677');
      }

      if (isCordova()) {
        return openExternalLink('https://play.google.com/store/apps/details?id=org.codaco.NetworkCanvasInterviewer6');
      }

      if (!assets || assets.length === 0) {
        return openExternalLink('https://networkcanvas.com/download.html');
      }

      if (isMacOS()) {
        // eslint-disable-next-line @codaco/spellcheck/spell-checker
        const dmg = find(assets, value => value.name.split('.').pop() === 'dmg');
        return openExternalLink(dmg.browser_download_url);
      }

      if (isWindows()) {
        // eslint-disable-next-line @codaco/spellcheck/spell-checker
        const exe = find(assets, value => value.name.split('.').pop() === 'exe');
        return openExternalLink(exe.browser_download_url);
      }

      return openExternalLink('https://networkcanvas.com/download.html');
    };

    const getConfirmLabel = () => {
      if (isCordova()) {
        if (isIOS()) {
          return 'Visit App Store';
        }

        return 'Visit Play Store';
      }

      return 'Download Installer';
    };

    dispatch(dialogActions.openDialog({
      type: 'Confirm',
      title: 'Release Notes',
      confirmLabel: getConfirmLabel(),
      onConfirm: openPlatformAsssetURL,
      message: (
        <div className="dialog-release-notes">
          <p>
            Please read the following release notes carefully as changes in the software
            may impact the interview experience substantially, and in some cases may even prevent
            you from collecting data until further updates are installed.
          </p>
          <ReactMarkdown
            className="dialog-release-notes__notes"
            renderers={renderers}
            source={message}
          />
        </div>
      ),
    }));
  };

  const checkForUpdate = async () => {
    const currentVersion = await getVersion();

    fetch(updateURL)
      .then(response => response.json())
      .then(({ name, body, assets }) => {
        if (compareVersions.compare(currentVersion, name, '<')) {
          if (dismissedVersion && dismissedVersion.includes(name)) {
            return;
          }

          const handleDismiss = () => {
            setDismissedVersion(name);
            dispatch(toastActions.removeToast('update-toast'));
          };

          dispatch(toastActions.addToast({
            id: 'update-toast',
            type: 'info',
            classNames: 'update-available-toast',
            title: `Version ${name} available`,
            autoDismiss: false,
            content: (
              <React.Fragment>
                <p>
                  A new version of Network Canvas Interviewer is available. To
                  upgrade, see the link in the release notes.
                </p>
                <div className="toast-button-group">
                  <Button color="platinum--dark" onClick={handleDismiss}>Hide for this release</Button>
                  <Button color="neon-coral" onClick={() => showReleaseNotes(body, assets)}>Show Release Notes</Button>
                </div>
              </React.Fragment>
            ),
          }));
        } else {
          // eslint-disable-next-line no-console
          console.info(`No update available (current: ${currentVersion}, latest: ${name}).`);
        }
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.warn('Error checking for updates:', error);
      });
  };

  useEffect(() => {
    setTimeout(checkForUpdate, 1500); // Timeout is to make update notification more impactful
  }, [updateURL]);
};

export default useUpdater;

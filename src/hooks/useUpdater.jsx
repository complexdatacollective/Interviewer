import compareVersions from 'compare-versions';
import { find } from 'lodash';
import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';

import { Button } from '@codaco/ui';
import { Markdown } from '@codaco/ui/lib/components/Fields';

import ExternalLink, { openExternalLink } from '../components/ExternalLink';
import { actionCreators as dialogActions } from '../ducks/modules/dialogs';
import { actionCreators as toastActions } from '../ducks/modules/toasts';
import {
  isAndroid,
  isIOS,
  isLinux,
  isMacOS,
  isPreview,
  isWindows,
} from '../utils/Environment';
import getVersion from '../utils/getVersion';
import useDismissedUpdatesState from './useDismissedUpdatesState';

// Custom renderer for links so that they open correctly in an external browser
const markdownComponents = {
  a: ({ children, href }) => (
    <ExternalLink href={href}>{children}</ExternalLink>
  ),
};

export const getPlatformSpecificContent = (assets) => {
  if (isIOS()) {
    return {
      buttonText: 'Open App Store',
      buttonLink:
        'https://apps.apple.com/us/app/network-canvas-interviewer/id1538673677',
    };
  }

  if (isAndroid()) {
    return {
      buttonText: 'Open Play Store',
      buttonLink:
        'https://play.google.com/store/apps/details?id=org.codaco.NetworkCanvasInterviewer6',
    };
  }

  if (!assets || assets.length === 0) {
    return {
      buttonText: 'Open Download Page',
      buttonLink: 'https://networkcanvas.com/download.html',
    };
  }

  if (isMacOS()) {
    const dmg = find(assets, (value) => value.name.split('.').pop() === 'dmg');
    return {
      buttonText: 'Download Installer',
      buttonLink: dmg.browser_download_url,
    };
  }

  if (isWindows()) {
    const exe = find(assets, (value) => value.name.split('.').pop() === 'exe');
    return {
      buttonText: 'Download Installer',
      buttonLink: exe.browser_download_url,
    };
  }

  if (isLinux()) {
    return {
      buttonText: 'Open GitHub Release',
      buttonLink:
        'https://github.com/complexdatacollective/Interviewer/releases/latest',
    };
  }

  return {
    buttonText: 'Open Download Page',
    buttonLink: 'https://networkcanvas.com/download.html',
  };
};

export const checkEndpoint = (updateEndpoint, currentVersion) =>
  fetch(updateEndpoint)
    .then((response) => response.json())
    .then(({ name, body, assets }) => {
      if (compareVersions.compare(currentVersion, name, '<')) {
        return {
          newVersion: name,
          releaseNotes: body,
          releaseAssets: assets,
        };
      }
      return false;
    })
    .catch((_error) => {
      // Don't reject, as we don't want to handle this error - just fail silently.
      return Promise.resolve(false);
    });

const useUpdater = (updateEndpoint, timeout = 0) => {
  const dispatch = useDispatch();
  const [dismissedUpdates, dismissUpdate] = useDismissedUpdatesState();
  const isPreviewMode = isPreview();

  const handleDismiss = (version) => {
    dismissUpdate(version);
    dispatch(toastActions.removeToast('update-toast'));
  };

  const showReleaseNotes = (releaseNotes, releaseButtonContent) => {
    const { buttonText, buttonLink } = releaseButtonContent;

    dispatch(
      dialogActions.openDialog({
        type: 'Confirm',
        title: 'Release Notes',
        confirmLabel: buttonText,
        onConfirm: () => openExternalLink(buttonLink),
        message: (
          <div className="dialog-release-notes allow-text-selection">
            <p>
              Please read the following release notes carefully as changes in
              the software may impact the interview experience substantially,
              and in some cases may even prevent you from collecting data until
              further updates are installed.
            </p>
            <Markdown
              className="dialog-release-notes__notes"
              markdownRenderers={markdownComponents}
              label={releaseNotes}
            />
          </div>
        ),
      }),
    );
  };

  const checkForUpdate = async () => {
    const updateAvailable = await getVersion().then((version) =>
      checkEndpoint(updateEndpoint, version),
    );

    if (!updateAvailable) {
      return;
    }

    const { newVersion, releaseNotes, releaseAssets } = updateAvailable;

    const releaseButtonContent = getPlatformSpecificContent(releaseAssets);

    // Don't notify the user if they have dismissed this version.
    if (dismissedUpdates.includes(newVersion)) {
      return;
    }

    dispatch(
      toastActions.addToast({
        id: 'update-toast',
        type: 'info',
        classNames: 'update-available-toast',
        title: `Version ${newVersion} available`,
        autoDismiss: false,
        content: (
          <>
            <p>
              A new version of Network Canvas Interviewer is available. To
              upgrade, see the link in the release notes.
            </p>
            <div className="toast-button-group">
              <Button
                color="platinum--dark"
                onClick={() => handleDismiss(newVersion)}
              >
                Hide for this release
              </Button>
              <Button
                color="neon-coral"
                onClick={() =>
                  showReleaseNotes(releaseNotes, releaseButtonContent)
                }
              >
                Show Release Notes
              </Button>
            </div>
          </>
        ),
      }),
    );
  };

  // `checkForUpdate` is recreated every render (it closes over dismissedUpdates
  // and dispatches toasts/dialogs that trigger re-renders). Depending on it would
  // re-run the effect each render, re-scheduling timers and re-fetching. Keep the
  // latest in a ref and depend only on the stable primitives.
  const checkForUpdateRef = useRef(checkForUpdate);
  checkForUpdateRef.current = checkForUpdate;

  useEffect(() => {
    if (isPreviewMode) {
      return;
    }

    const delay = setTimeout(() => checkForUpdateRef.current(), timeout);

    return () => clearTimeout(delay);
  }, [isPreviewMode, timeout]);
};

export default useUpdater;

import React from 'react';
import uuid from 'uuid';
import { CancellationError } from 'builder-util-runtime';
import { ProgressBar } from '@codaco/ui';
import { store } from '../../../ducks/store';
import { actionCreators as installedProtocolActions } from '../../../ducks/modules/installedProtocols';
import { actionCreators as toastActions } from '../../../ducks/modules/toasts';
import { showStartImportToast } from './shared/toasts';
import { CapacitorImportManager } from './ImportManager';


const dispatch = store.dispatch;
const getState = store.getState;

export const startImportFromFile = async () => {
  const importManager = CapacitorImportManager;
  const managerInstance = new importManager();

  const toastUUID = uuid();

  const handleAbort = () => {
    managerInstance.abort();
    showCancellationToast();
  };

  managerInstance.on('start', () => showStartImportToast(toastUUID, handleAbort));

  managerInstance.on('complete', (protocolJson) => {
    dispatch(installedProtocolActions.importProtocolCompleteAction(protocolJson));
    showImportCompleteToast();
  });

  managerInstance.on('error', (error) => {
    console.error('Error importing protocol', error);
    showImportFailedToast();
  });

  managerInstance.on('update', (title, progress) => {
    dispatch(toastActions.updateToast(toastUUID, {
      title,
      content: (
        <React.Fragment>
          <ProgressBar orientation="horizontal" percentProgress={progress} />
        </React.Fragment>
      ),
    }));
  });

  try {
    await managerInstance.begin();
  } catch (error) {
    if (error instanceof CancellationError) {
      showCancellationToast();
    } else {
      console.error(error);
    }
  }
}

export const importProtocolFromURI = () => {
  console.log('TODO: importProtocolFromURI');
}

// export const importProtocolFromURI = (uri, usePairedServer) => {
//   let cancelled = false; // Top-level cancelled property used to abort promise chain
//   let pairedServer;
//   let protocolUid;
//   let previousUid;
//   const filename = filenameFromURI(uri);
//   const protocolName = protocolNameFromFilename(filename);

//   if (usePairedServer) {
//     pairedServer = getState().pairedServer;
//   }

//   const toastUUID = uuid();

//   // Create a toast to show the status as it updates
//   dispatch(toastActions.addToast({
//     id: toastUUID,
//     type: 'info',
//     title: 'Importing Protocol...',
//     CustomIcon: (<Spinner small />),
//     autoDismiss: false,
//     dismissHandler: () => {
//       showCancellationToast();
//       cancelled = true;
//     },
//     content: (
//       <React.Fragment>
//         <ProgressBar orientation="horizontal" percentProgress={10} />
//       </React.Fragment>
//     ),
//   }));

//   const importPromise = new Promise((resolve, reject) => {
//     checkExistingProtocol(protocolName)
//       .then((existingUid) => {
//         previousUid = existingUid;

//         dispatch(toastActions.updateToast(toastUUID, {
//           title: 'Downloading Protocol...',
//           content: (
//             <React.Fragment>
//               <ProgressBar orientation="horizontal" percentProgress={30} />
//             </React.Fragment>
//           ),
//         }));
//         return downloadProtocol(uri, pairedServer);
//       })
//       .then((tempLocation) => {
//         if (cancelled) return cancelledImport();

//         dispatch(toastActions.updateToast(toastUUID, {
//           title: 'Extracting to temporary storage...',
//           content: (
//             <React.Fragment>
//               <ProgressBar orientation="horizontal" percentProgress={40} />
//             </React.Fragment>
//           ),
//         }));
//         return extractProtocol(tempLocation);
//       }, catchError)
//       .then((protocolLocation) => {
//         if (cancelled) return cancelledImport();

//         protocolUid = protocolLocation;
//         dispatch(toastActions.updateToast(toastUUID, {
//           title: 'Validating protocol...',
//           content: (
//             <React.Fragment>
//               <ProgressBar orientation="horizontal" percentProgress={80} />
//             </React.Fragment>
//           ),
//         }));
//         return parseProtocol(protocolLocation, protocolName);
//       }, catchError)
//       .then((protocolContent) => {
//         if (cancelled) return cancelledImport();
//         if (previousUid) {
//           return moveToExistingProtocol(previousUid, protocolContent);
//         }
//         return protocolContent;
//       })
//       .then((protocolContent) => {
//         if (cancelled) return cancelledImport();

//         // Send the payload to installedProtocols
//         dispatch(installedProtocolActions.importProtocolCompleteAction(protocolContent));

//         // Remove the status toast
//         dispatch(toastActions.removeToast(toastUUID));
//         dispatch(toastActions.addToast({
//           type: 'success',
//           title: 'Finished!',
//           autoDismiss: true,
//           content: (
//             <React.Fragment>
//               <p>Protocol installed successfully.</p>
//             </React.Fragment>
//           ),
//         }));
//         return resolve();
//       }, catchError)
//       .catch(
//         (error) => {
//           // Remove the status toast
//           dispatch(toastActions.removeToast(toastUUID));

//           // attempt to clean up files
//           if (protocolUid) cleanUpProtocol(protocolUid);

//           // If this wasn't user cancellation, dispatch an error
//           if (!(error instanceof CancellationError)) {
//             dispatch(installedProtocolActions.importProtocolFailedAction(error));
//           }
//         },
//       );
//   });

//   importPromise.abort = () => {
//     cancelled = true;
//     if (protocolUid) cleanUpProtocol(protocolUid); // attempt to clean up files
//   };

//   return importPromise;
// };


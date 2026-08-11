import { batch } from 'react-redux';

import { actionCreators as exportProgressActions } from '../ducks/modules/exportProgress';
import { actionCreators as sessionsActions } from '../ducks/modules/sessions';
import { actionCreators as toastActions } from '../ducks/modules/toasts';
import { store } from '../ducks/store';
import { runExport } from './export/runExport';
import { saveExportBlob } from './export/saveExport';
import { getRemoteProtocolID } from './networkFormat';

const { dispatch, getState } = store;

const noop = () => {};

// Roughly split the progress bar between the two pipeline stages that report
// per-item counts ('generating' then 'outputting').
const PROGRESS_STAGE_WEIGHT = {
  generating: { base: 0, span: 50 },
  outputting: { base: 50, span: 50 },
};

const showCancellationToast = () => {
  dispatch(
    toastActions.addToast({
      type: 'warning',
      title: 'Export cancelled',
      content: (
        <>
          <p>You cancelled the export process.</p>
        </>
      ),
    }),
  );
};

const showSuccessToast = () => {
  dispatch(
    toastActions.addToast({
      type: 'success',
      title: 'Export Complete!',
      autoDismiss: true,
      content: (
        <>
          <p>Your sessions were exported successfully.</p>
        </>
      ),
    }),
  );
};

const mapEventToProgress = (event) => {
  if (event.type === 'stage') {
    dispatch(
      exportProgressActions.update({
        statusText: event.message,
        percentProgress: 0,
      }),
    );
    return;
  }

  if (event.type === 'progress') {
    const weight = PROGRESS_STAGE_WEIGHT[event.stage] ?? { base: 0, span: 100 };
    const fraction = event.total > 0 ? event.current / event.total : 0;
    dispatch(
      exportProgressActions.update({
        statusText:
          event.stage === 'outputting'
            ? 'Writing output...'
            : 'Generating files...',
        percentProgress: Math.round(weight.base + fraction * weight.span),
      }),
    );
  }
};

/**
 * Build an ExportOptions object from device settings.
 * The output filename is derived by the pipeline and surfaced via the sink
 * (see runExport).
 */
const buildExportOptions = (deviceSettings) => ({
  exportGraphML: deviceSettings.exportGraphML,
  exportCSV: deviceSettings.exportCSV,
  globalOptions: {
    useScreenLayoutCoordinates: deviceSettings.useScreenLayoutCoordinates,
    screenLayoutHeight: deviceSettings.screenLayoutHeight,
    screenLayoutWidth: deviceSettings.screenLayoutWidth,
  },
});

/**
 * Map the selected raw sessions to the InterviewExportInput[] the new pipeline
 * consumes, and build the keyed protocols record it needs to resolve codebooks.
 *
 * The protocol record is keyed by the SHA-256 of the protocol name
 * (getRemoteProtocolID), matching the protocolHash stored on each interview so
 * the pipeline can join the two.
 */
const buildExportInputs = async (selectedSessionIds, sessions, protocols) => {
  const interviews = [];
  const protocolRecord = {};
  const hashCache = new Map();

  const hashForProtocol = async (protocol) => {
    if (hashCache.has(protocol)) {
      return hashCache.get(protocol);
    }
    const hash = await getRemoteProtocolID(protocol.name);
    hashCache.set(protocol, hash);
    return hash;
  };

  for (const sessionId of selectedSessionIds) {
    const session = sessions[sessionId];
    if (!session) {
      continue;
    }
    const protocol = protocols[session.protocolUID];
    if (!protocol) {
      continue;
    }

    const protocolHash = await hashForProtocol(protocol);

    interviews.push({
      id: sessionId,
      participantIdentifier: session.caseId,
      startTime: new Date(session.startedAt),
      finishTime: session.finishedAt ? new Date(session.finishedAt) : null,
      network: session.network,
      protocolHash,
    });

    if (!protocolRecord[protocolHash]) {
      protocolRecord[protocolHash] = {
        hash: protocolHash,
        name: protocol.name,
        codebook: protocol.codebook,
      };
    }
  }

  return { interviews, protocolRecord };
};

/**
 * Orchestrates a renderer-side export via @codaco/network-exporters.
 *
 * @param {string[]} selectedSessionIds Session keys selected for export.
 * @returns {Promise<{ run: () => Promise<void>, abort: () => void, setConsideringAbort: (value: boolean) => void }>}
 */
export const exportToFile = async (selectedSessionIds) => {
  dispatch(exportProgressActions.reset());

  const { sessions, installedProtocols, deviceSettings } = getState();

  const { interviews, protocolRecord } = await buildExportInputs(
    selectedSessionIds,
    sessions,
    installedProtocols,
  );

  const options = buildExportOptions(deviceSettings);
  const sessionIds = interviews.map((interview) => interview.id);

  // Lazily created so `abort()` can interrupt an in-flight run; defaults to a
  // no-op until `run()` starts the pipeline.
  let activeAbort = noop;

  const run = async () => {
    dispatch(
      exportProgressActions.update({
        statusText: 'Starting export...',
        percentProgress: 0,
      }),
    );

    const { promise, abort } = runExport({
      options,
      sessionIds,
      interviews,
      protocols: protocolRecord,
      onEvent: mapEventToProgress,
    });

    activeAbort = abort;

    const { result, blob, fileName } = await promise;

    // Persist the produced archive to disk (Electron save dialog / Cordova fs).
    if (blob && fileName) {
      const { saved } = await saveExportBlob({ blob, fileName });
      if (!saved) {
        // User dismissed the save dialog; treat as a cancellation.
        dispatch(exportProgressActions.reset());
        showCancellationToast();
        return;
      }
    }

    dispatch(exportProgressActions.reset());

    const succeededIds = Array.from(
      new Set(
        (result?.successfulExports ?? []).map((entry) => entry.sessionId),
      ),
    );

    if (succeededIds.length > 0) {
      batch(() => {
        succeededIds.forEach((id) =>
          dispatch(sessionsActions.setSessionExported(id)),
        );
      });
    }

    showSuccessToast();
  };

  const abort = () => {
    activeAbort();
    dispatch(exportProgressActions.reset());
    showCancellationToast();
  };

  // NOTE: the maintained pipeline has no "considering abort" concept; the UI's
  // confirm dialog drives the actual abort, so this is a no-op kept for
  // contract compatibility with SessionManagementScreen.
  return { run, abort, setConsideringAbort: noop };
};

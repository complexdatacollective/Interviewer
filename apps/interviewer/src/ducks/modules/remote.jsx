import { actionCreators as resetActions } from './reset';
import { actionCreators as installedProtocolActions } from './installedProtocols';
import { actionCreators as sessionActions } from './sessions';

/**
 * action dispatchers for remotely driving Interviewer
 */

/**
 * show a specific stage for a provided protocol
 * 0. RESET
 * 1. IMPORT_PROTOCOL_COMPLETE
 * 2. ADD_SESSION
 * ~3. LOAD_SESSION~ handled automatically by ADD_SESSION
 * 4. UPDATE_STAGE
 */

const previewStage = (protocol = {}, stageIndex = 0) => (dispatch) => {
  const caseId = 'PREVIEW';
  const protocolUID = protocol.uid;

  // Reset app
  dispatch(resetActions.resetAppState());

  // Load protocol
  dispatch(installedProtocolActions.importProtocolCompleteAction(protocol));

  // Create session and open specified stage
  return dispatch(sessionActions.addSession(caseId, protocolUID))
    .then((sessionId) => {
      // We have to update stage via path
      const path = `/session/${sessionId}/${stageIndex}`;
      // dispatch(push(path));
      console.warn('preViewStage wanted to use push from connectected-react-router but we removed it');
      return { protocol, stageIndex };
    });
};

const reset = resetActions.resetAppState;

export const actionCreators = {
  previewStage,
  reset,
};

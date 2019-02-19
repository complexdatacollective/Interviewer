import { actionTypes as ProtocolActionTypes } from './importProtocol';

/**
 * `protocols` maintains some cached data and metadata about the protocol files available on disk.
 *
 * For downloaded protocols, `name` is the unique ID.
 *
 * As a side effect for SET_PROTOCOL (from `./protocol`), which provides the parsed protocol JSON,
 * the store is updated.
 */


// Add new side effect here: listen for protocol import complete, and copy payload
// to this state.


const IMPORT_PROTOCOL_COMPLETE = ProtocolActionTypes.IMPORT_PROTOCOL_COMPLETE;

const initialState = [
];

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case IMPORT_PROTOCOL_COMPLETE: {
      const newProtocol = {
        ...action.protocolData.protocol,
        path: action.protocolData.path,
      };

      // Allow for updating as well as installing new
      const existingIndex = state.findIndex(protocol => protocol.name === newProtocol.name);

      if (existingIndex > -1) {
        const updatedState = [...state];
        updatedState.splice(existingIndex, 1, newProtocol);
        return updatedState;
      }

      return [
        ...state,
        newProtocol,
      ];
    }
    default:
      return state;
  }
}

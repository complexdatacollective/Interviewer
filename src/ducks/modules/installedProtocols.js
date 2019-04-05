import { omit, findKey } from 'lodash';
import { actionTypes as importProtocolActions } from './importProtocol';

const IMPORT_PROTOCOL_COMPLETE = importProtocolActions.IMPORT_PROTOCOL_COMPLETE;

const initialState = {};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case IMPORT_PROTOCOL_COMPLETE: {
      const newProtocol = action.protocolData;

      // If the protocol name (which is the true UID of protocol) already exists, overwrite.
      const existingIndex = findKey(state, protocol => protocol.name === newProtocol.name);

      if (existingIndex) {
        return {
          ...state,
          [existingIndex]: omit(newProtocol, 'uid'),
        };
      }

      return {
        ...state,
        [newProtocol.uid]: omit(newProtocol, 'uid'),
      };
    }
    default:
      return state;
  }
}

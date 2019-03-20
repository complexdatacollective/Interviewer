import { actionTypes as ProtocolActionTypes } from './importProtocol';

const IMPORT_PROTOCOL_COMPLETE = ProtocolActionTypes.IMPORT_PROTOCOL_COMPLETE;

const initialState = {};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case IMPORT_PROTOCOL_COMPLETE: {
      // // Allow for updating as well as installing new
      // const existingIndex = state.findIndex(protocol => protocol.name === newProtocol.name);

      // if (existingIndex > -1) {
      //   const updatedState = [...state];
      //   updatedState.splice(existingIndex, 1, newProtocol);
      //   return updatedState;
      // }


      // TODO: require action.protocolData.uid, or fail.

      return {
        ...state,
        [action.protocolData.uid]: action.protocolData,
      };
    }
    default:
      return state;
  }
}

import { actionTypes as ProtocolActionTypes } from './protocol';

/**
 * `protocols` maintains some cached data and metadata about the protocol files available on disk.
 *
 * For downloaded protocols, `name` is the unique ID.
 *
 * As a side effect for SET_PROTOCOL (from `./protocol`), which provides the parsed protocol JSON,
 * the store is updated.
 */

const SET_PROTOCOL = ProtocolActionTypes.SET_PROTOCOL;

const initialState = [
  {
    name: 'Teaching Protocol',
    description: 'version 4.0.0',
    path: 'education.netcanvas',
    isFactoryProtocol: true,
  },
  {
    name: 'Development Protocol',
    description: 'version 4.0.0',
    path: 'development.netcanvas',
    isFactoryProtocol: true,
  },
];

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case SET_PROTOCOL: {
      // TODO: Protocol should be validated before import; this check shouldn't be needed
      if (!action.protocol.name) { return state; }

      // Do not allow updates to factory protocols
      if (action.isFactoryProtocol) { return state; }

      const newProtocol = {
        name: action.protocol.name,
        description: action.protocol.description,
        path: action.path,
      };

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

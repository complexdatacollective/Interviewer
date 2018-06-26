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

      const exists = action.isFactoryProtocol ||
        state.some(protocol => protocol.name === action.protocol.name);

      // FIXME: should update description if that changes (for non-factory).
      // FIXME: should update path if that changes (for non-factory).
      if (exists) {
        return state;
      }

      return [
        ...state,
        {
          name: action.protocol.name,
          description: action.protocol.description,
          path: action.path,
        },
      ];
    }
    default:
      return state;
  }
}

import { persistor } from '../store';

const CREATE_PARTICIPANT = 'CREATE_PARTICIPANT';
const DESTROY_PARTICIPANT = 'DESTROY_PARTICIPANT';
const PATCH_PARTICIPANT = 'PATCH_PARTICIPANT';

const initialState = {
  userProfile: {},
  userProfileComplete: false,
  errorMessage: '',
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case CREATE_PARTICIPANT:
      return {
        ...state,
        userProfile: {
          ...action.params,
        },
      };
    case DESTROY_PARTICIPANT:
      persistor.purge(['participant']);
      return state;
    case PATCH_PARTICIPANT:
      return {
        ...state,
        userProfile: {
          ...state.userProfile,
          ...action.userProfile,
        },
      };
    default:
      return state;
  }
}

function createParticipant(params) {
  return {
    type: CREATE_PARTICIPANT,
    params,
  };
}

function patchParticipantProfile(userProfile) {
  return {
    type: PATCH_PARTICIPANT,
    userProfile,
  };
}

function destroyParticipant() {
  return {
    type: DESTROY_PARTICIPANT,
  };
}


const actionCreators = {
  createParticipant,
  destroyParticipant,
  patchParticipantProfile,
};

const actionTypes = {
  CREATE_PARTICIPANT,
  DESTROY_PARTICIPANT,
  PATCH_PARTICIPANT,
};

export {
  actionCreators,
  actionTypes,
};

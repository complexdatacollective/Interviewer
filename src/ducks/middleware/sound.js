import { playSound } from '../../utils/playSound';
import { actionTypes as networkActionTypes } from '../modules/network';
import createNodeSound from '../../interaction-sounds/create-node.wav';
import removeNodeSound from '../../interaction-sounds/discard.wav';
import toggleOnSound from '../../interaction-sounds/toggle-on.wav';
import toggleOffSound from '../../interaction-sounds/toggle-off.wav';
import openAppSound from '../../interaction-sounds/open-app.wav';
import addEdgeSound from '../../interaction-sounds/create-edge.wav';
import errorSound from '../../interaction-sounds/error.wav';
import edgeLinkingSound from '../../interaction-sounds/node-linking-mode.wav';
import finishSessionSound from '../../interaction-sounds/finish-interview.wav';
import { getNetworkEdges } from '../../selectors/network';

const sounds = {
  open: playSound({ src: openAppSound }),
  createNode: playSound({ src: createNodeSound }),
  createEdge: playSound({ src: addEdgeSound }),
  removeNode: playSound({ src: removeNodeSound }),
  toggleOn: playSound({ src: toggleOnSound, debounceInterval: 0 }),
  toggleOff: playSound({ src: toggleOffSound, debounceInterval: 0 }),
  error: playSound({ src: errorSound }),
  link: playSound({ src: edgeLinkingSound, loop: true }),
  finishSession: playSound({ src: finishSessionSound }),
};
/**
 * Redux middleware that plays sounds on certain actions
 * @param store
 * @returns
 */
const sound = (store) => (next) => (action) => {
  const result = next(action);
  const enableSounds = store.getState().deviceSettings.enableExperimentalSounds;

  if (!enableSounds) {
    return result;
  }

  switch (action.type) {
    case 'PLAY_SOUND':
      sounds[action.sound].play();
      break;
    case 'STOP_SOUND':
      sounds[action.sound].stop();
      break;
    case 'DEVICE_READY':
      sounds.open.play();
      break;
    case 'UPDATE_PROMPT': {
      sounds.link.stop();
      break;
    }
    case networkActionTypes.ADD_NODE: {
      sounds.createNode.play();
      break;
    }
    case networkActionTypes.UPDATE_NODE: {
      if (action.sound) {
        playSound({ src: action.sound }).play();
      }

      break;
    }
    case networkActionTypes.REMOVE_NODE:
      sounds.removeNode.play();
      break;
    case networkActionTypes.REMOVE_NODE_FROM_PROMPT:
      sounds.toggleOff.play();
      break;
    case networkActionTypes.ADD_NODE_TO_PROMPT:
      sounds.toggleOn.play();
      break;
    case networkActionTypes.TOGGLE_EDGE: {
      const { from, to, type } = action.modelData;
      const sessionEdges = getNetworkEdges(store.getState());

      const edgeExists = sessionEdges.some((edge) => (
        edge.from === from && edge.to === to && edge.type === type
      ));

      if (edgeExists) {
        sounds.createEdge.play();
      } else {
        sounds.toggleOff.play();
      }
      break;
    }
    case networkActionTypes.TOGGLE_NODE_ATTRIBUTES: {
      // When toggling on, action.attributes[variableUID] = true
      // When toggling off, action.attributes[variableUID] = false
      const { attributes } = action;

      if (attributes) {
        const toggledOn = Object.values(attributes).includes(true);

        if (toggledOn) {
          playSound({ src: toggleOnSound, debounceInterval: 0 }).play();
        } else {
          playSound({ src: toggleOffSound, debounceInterval: 0 }).play();
        }
      }

      break;
    }
    case networkActionTypes.ADD_EDGE:
      sounds.createEdge.play();
      break;
    case networkActionTypes.REMOVE_EDGE:
      sounds.toggleOff.play();
      break;
    // eslint-disable-next-line @codaco/spellcheck/spell-checker
    case '@@redux-form/SET_SUBMIT_FAILED':
      sounds.error.play();
      break;
    default:
      break;
  }

  return result;
};

export default sound;

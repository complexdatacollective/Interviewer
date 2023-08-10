import { playSound } from '../../hooks/useSound';
import createNodeSound from '../../interaction-sounds/create-node.wav';
import removeNodeSound from '../../interaction-sounds/discard.wav';
import toggleOnSound from '../../interaction-sounds/toggle-on.wav';
import toggleOffSound from '../../interaction-sounds/toggle-off.wav';
import dropSound from '../../interaction-sounds/drop-node.wav';
import openApp from '../../interaction-sounds/open-app.wav';

// Debounced action handler, that prevents the same sound from playing multiple times in a row

/**
 * Redux middleware that plays sounds on certain actions
 * @param storeAPI
 * @returns
 */
const sound = (storeAPI) => (next) => (action) => {
  const result = next(action);

  // Sound sprites
  const openSound = playSound(openApp);
  const addSound = playSound(createNodeSound);
  const removeSound = playSound(removeNodeSound);
  const toggleOn = playSound(toggleOnSound);
  const toggleOff = playSound(toggleOffSound);
  const dropNodeSound = playSound(dropSound);

  switch (action.type) {
    case 'DEVICE_READY':
      openSound.play();
      break;
    case 'ADD_NODE': {
      addSound.play();
      break;
    }
    case 'REMOVE_NODE':
      removeSound.play();
      break;
    case 'REMOVE_NODE_FROM_PROMPT': // Dragging node out of main panel and into side panel
      dropNodeSound.play();
      break;
    case 'UPDATE_NODE': // for dropping nodes into main node list
      // Todo: implement this as sound in meta property of action. this
      // will allow different sound for node side panel vs ordinal bin.
      dropNodeSound.play();
      break;
    default:
      break;
  }

  return result;
};

export default sound;

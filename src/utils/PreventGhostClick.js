/**
 * Prevent click events after a touchend.
 *
 * Originally from Jorik Tangelder's gist (https://gist.github.com/jtangelder/361052976f044200ea17)
 * Inspired/copy-paste from this article of Google by Ryan Fioravanti
 * https://developers.google.com/mobile/articles/fast_buttons#ghost
 *
 * USAGE:
 * Prevent the click event for an certain element
 * ````
 *  PreventGhostClick(myElement);
 * ````
 *
 * Prevent clicks on the whole document (not recommended!!) *
 * ````
 *  PreventGhostClick(document);
 * ````
 *
 */

let coordinates = [];
const threshold = 25;
const timeout = 2500;

/**
  * prevent clicks if they're in a registered XY region
  * @param {MouseEvent} ev
  */
function preventGhostClicks(event) {
  for (let i = 0; i < coordinates.length; i += 1) {
    const x = coordinates[i][0];
    const y = coordinates[i][1];

    // within the range, so prevent the click
    if (Math.abs(event.clientX - x) < threshold && Math.abs(event.clientY - y) < threshold) {
      event.stopPropagation();
      event.preventDefault();
      break;
    }
  }
}

/**
  * reset the coordinates array
  */
function resetCoordinates() {
  coordinates = [];
}

/**
  * remove the first coordinates set from the array
  */
function popCoordinates() {
  coordinates.splice(0, 1);
}

/**
  * if it is an final touchend, we want to register it's place
  * @param {TouchEvent} ev
  */
function registerCoordinates(event) {
  // touchend is triggered on every releasing finger
  // changed touches always contain the removed touches on a touchend
  // the touches object might contain these also at some browsers (firefox os)
  // so touches - changedTouches will be 0 or lower, like -1, on the final touchend
  if (event.touches.length - event.changedTouches.length <= 0) {
    const touch = event.changedTouches[0];
    coordinates.push([touch.clientX, touch.clientY]);

    setTimeout(popCoordinates, timeout);
  }
}

/**
  * prevent click events for the given element
  * @param {EventTarget} el
  */
export default function PreventGhostClick(element) {
  // no touch support
  if (!('ontouchstart' in window)) {
    return;
  }
  element.addEventListener('touchstart', resetCoordinates, true);
  element.addEventListener('touchend', registerCoordinates, true);
}

document.addEventListener('click', preventGhostClicks, true);

/* eslint-disable import/prefer-default-export */
import { debounce } from './lodash-replacements';

// Play a given sound
export const playSound = ({
  src,
  loop = false,
  volume = 1,
  debounceInterval = 1000,
}) => {
  if (!src) {
    throw new Error('No sound source provided');
  }

  let isPlaying = false;
  const audio = new Audio(src);
  audio.volume = volume;
  audio.loop = loop;

  const debouncedPlay = debounce(() => {
    audio.play();
    isPlaying = true;
  }, debounceInterval, { leading: true, trailing: false });

  const stop = () => {
    audio.pause();
    audio.currentTime = 0;
    isPlaying = false;
  };

  return {
    isPlaying,
    play: debouncedPlay,
    stop,
  };
};

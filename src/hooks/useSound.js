import { useCallback, useEffect, useState } from 'react';

export const playSound = (src, callback) => {
  const audio = new Audio(src);
  audio.addEventListener('ended', callback);

  return {
    play: (loop = false) => {
      audio.loop = loop;
      audio.play();
    },
    stop: () => {
      audio.pause();
      audio.currentTime = 0;
    },
  };
};

export default function useSound({
  src,
  volume = 1,
  loop = false,
}) {
  const [audio] = useState(new Audio(src));
  const [playing, setPlaying] = useState(false);

  const stop = useCallback(() => {
    audio.pause();
    audio.currentTime = 0;
    setPlaying(false);
  }, [audio]);

  const play = useCallback(() => {
    if (playing) {
      stop();
    }

    audio.volume = volume;
    audio.loop = loop;
    audio.play();
    setPlaying(true);
  }, [audio, volume, loop]);

  useEffect(() => {
    audio.addEventListener('ended', () => setPlaying(false));
    return () => {
      audio.removeEventListener('ended', () => setPlaying(false));
    };
  }, [audio]);

  return {
    isPlaying: playing,
    play,
    stop,
  };
}

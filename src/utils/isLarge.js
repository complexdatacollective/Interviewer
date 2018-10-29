const isLarge = () =>
  window.matchMedia('screen and (min-device-aspect-ratio: 8/5), (min-device-height: 1800px)').matches;

export default isLarge;

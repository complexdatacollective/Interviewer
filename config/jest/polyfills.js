global.requestAnimationFrame = (callback) => {
  setTimeout(callback, 1);
};

global.cancelAnimationFrame = () => {};

global.SVGElement = global.Element;

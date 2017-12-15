global.requestAnimationFrame = function (callback) {
  setTimeout(callback, 0);
};

global.cancelAnimationFrame = function(callback) {
  setTimeout(callback, 0);
};

global.SVGElement = global.Element;

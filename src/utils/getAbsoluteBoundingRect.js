/**
https://gist.github.com/rgrove/5463265

Returns a bounding rect for _el_ with absolute coordinates corrected for
scroll positions.

The native `getBoundingClientRect()` returns coordinates for an element's
visual position relative to the top left of the viewport, so if the element
is part of a scrollable region that has been scrolled, its coordinates will
be different than if the region hadn't been scrolled.

This method corrects for scroll offsets all the way up the node tree, so the
returned bounding rect will represent an absolute position on a virtual
canvas, regardless of scrolling.

@method getAbsoluteBoundingRect
@param {HTMLElement} el HTML element.
@return {Object} Absolute bounding rect for _el_.
* */

export default function getAbsoluteBoundingRect(el) {
  if (!el) {
    return 0;
  }

  let offsetX = (window.pageXOffset !== undefined)
    ? window.pageXOffset
    : (document.documentElement || document.body.parentNode || document.body).scrollLeft;

  let offsetY = (window.pageYOffset !== undefined)
    ? window.pageYOffset
    : (document.documentElement || document.body.parentNode || document.body).scrollTop;

  const rect = el.getBoundingClientRect();

  if (el !== document.body) {
    let parent = el.parentNode;

    // The element's rect will be affected by the scroll positions of
    // *all* of its scrollable parents, not just the window, so we have
    // to walk up the tree and collect every scroll offset. Good times.
    while (parent && parent !== document.body) {
      offsetX += parent.scrollLeft;
      offsetY += parent.scrollTop;
      parent = parent.parentNode;
    }
  }

  return {
    bottom: rect.bottom + offsetY,
    height: rect.height,
    left: rect.left + offsetX,
    right: rect.right + offsetX,
    top: rect.top + offsetY,
    width: rect.width,
  };
}

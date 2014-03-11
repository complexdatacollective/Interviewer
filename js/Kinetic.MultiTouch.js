/*!
 * Kinetic.MutiTouch - Experimental multi-touch support for Kineticjs using Touchy
 * https://github.com/atomictag/Kinetic.MultiTouch
 * (c) 2013 oneoverzero GmbH
 *
 * This code if free to use and modify by anyone and for any purpose.
 *
 * @atomictag is davide.mancuso@oneoverzero.net
 *
 */

(function(Kinetic, Touchy) {

    // Check if touch events are natively supported (used to enable Touchy emulation mode)
    var supportsTouch = !!('ontouchstart' in window || navigator.msMaxTouchPoints);

    // preventDefault handler
    var preventDefault = function (e) { e.preventDefault() };

    // All events are namespaced in order to prevent conflicts with Kinetic ones
    var NAMESPACE = ':multitouch';

    // The supported event list. This is exported.
    var events = {
        TOUCHSTART : 'touchstart' + NAMESPACE,
        TOUCHMOVE  : 'touchmove'  + NAMESPACE,
        TOUCHEND   : 'touchend'   + NAMESPACE,
        DRAGSTART  : 'dragstart'  + NAMESPACE,
        DRAGMOVE   : 'dragmove'   + NAMESPACE,
        DRAGEND    : 'dragend'    + NAMESPACE,
        TAP        : 'tap'        + NAMESPACE
    }

    // Register Touchy kinetic plugin
    Touchy.plugin('kinetic', function (elem, settings) {

        var stage = settings.stage; // Stage
        var defaultAutoDraw = settings.autoDraw; // Default autoDraw setting (if GSAP + KineticPlugin are used)

        // Convert point to stage coordinates (see _touchmove->_setTouchPosition)
        function toStagePoint(point) {
            var cp = stage._getContentPosition();
            return { x: point.x - cp.left, y : point.y - cp.top};
        }

        // Get the shape hit by the touch at the given point (which is relative to the container)
        function getHitShape(point) {
            // Convert touch location to stage coordinates
            var tp = toStagePoint(point);
            // Find node below point
            var obj = stage.getIntersection(tp);
            return obj && obj.shape;
        }

        // Scan the node hierarchy starting fron the given node for 'multitouch' directives.
        // This 1) finds the closest multitouch directive 2) finds the closest draggable node.
        function getMultiTouch(node) {
            if(!node) return undefined;
            var multitouch;
            do {
                // Prevent draggable and multitouch:draggable from stepping on each other.
                // Give the precedence to default dragging behaviour.
                if(node.attrs.draggable) {
                    return multitouch;
                }
                var mt = node.attrs.multitouch;
                if(mt) {
                    mt = _(mt).isObject() ? _(mt).clone() : {};
                    if(!multitouch) multitouch = mt;
                    if(mt.draggable) {
                        return _(multitouch).extend({ node : node }, mt);
                    }
                }
            } while(node = node.getParent());
            return multitouch;
        }

        // Convert a point to an event to be sent to event listeners. It doesn't seem to matter
        // too much what goes in there, although it would be good if it was an actual Touch Event.
        function toEvent(point) {
            return point; // TODO
        }

        // The callback invoked every time a touch gesture is started (one per finger!)
        return function(hand, finger) {

            // Intercept all touches
            finger.on('start', onTouchStart);

            // "Session" variables, i.e. persistent during a touch sequence
            var target,      // The target shape hit by the touch
                dragTarget,  // The drag-n-drop target (can be the target itself of one of its ancestors)
                dragging,    // Flag indicating whether a dragging session is on-going
                offset = {}, // Holder of the touch offset calculated on drag start
                autoDraw;    // Whether TweenMax autoDraw should be used instead of layer.batchDraw()

            // touchstart ('start') callback
            function onTouchStart(point) {
                var hit = getHitShape(point),
                    multitouch = getMultiTouch(hit);
                if(multitouch) {
                    // Cache the target
                    target = hit;
                    // Fire touchstart
                    target.fire(events.TOUCHSTART, toEvent(point), true);
                    // Register move/end callbacks
                    finger.on('move', onTouchMove);
                    finger.on('end', onTouchEnd);
                    // If there's a draggable target, register drag listeners
                    if(multitouch.draggable) {
                        // Store the drag target (which is the target or a node in the target's chain)
                        dragTarget = multitouch.node;
                        // Ensure the target is not already being dragged by another finger
                        if(!dragTarget._mtdragging) {
                            // Override default autoDraw behaviour as needed
                            autoDraw   = _(multitouch).has('autoDraw') ? multitouch.autoDraw : defaultAutoDraw;
                            // Register drag event handler
                            finger.on('move', onDragMove);
                        }
                    }
                } else {
                    // Node not listening or no multitouch enabled in the parent chain. Nothing to do here.
                }
            }

            // touchmove ('move') callback
            function onTouchMove(point) {
                if(!dragging && target === getHitShape(point)) {
                    target.fire(events.TOUCHMOVE, toEvent(point), true);
                }
            }

            // touchend ('end') callback
            function onTouchEnd(point) {
                if(target === getHitShape(point)) {
                    target.fire(events.TOUCHEND, toEvent(point), true);
                    if(!dragging) {
                        target.fire(events.TAP, toEvent(point), true);
                    }
                }
            }

            // dragstart ('move') callback
            function onDragStart(point) {

                dragging = true;

                var pos = toStagePoint(point),
                     ap = dragTarget.getAbsolutePosition();

                offset.x = pos.x - ap.x;
                offset.y = pos.y - ap.y;

                // Mark dragTarget as multi-touch dragging, so it won't be dragged by another finger until it's done
                dragTarget._mtdragging = true;

                // NOTE: To be fully compliant with Kinetic events, we should fore a TOUCHMOVE here
                target.fire(events.DRAGSTART, toEvent(point), true);
                finger.on('end', onDragEnd);
            }

            // dragmove ('move') callback
            function onDragMove(point) {

                // Initialize drag if not already
                if(!dragging) onDragStart(point);

                var pos = toStagePoint(point);
                var dbf = dragTarget.getDragBoundFunc();
                var newNodePos = {
                    x: pos.x - offset.x,
                    y: pos.y - offset.y
                };
                var evt = toEvent(point);
                if(dbf !== undefined) {
                    newNodePos = dbf.call(dragTarget, newNodePos, evt);
                }

                // Use GSAP to move the dragTarget if available.
                // You should use the kinetic plugin if you want to leverage layer autoDraw.
                if(window.TweenLite) {
                    var options = {};
                    // Check if the kinetic plugin is loaded
                    if(TweenLite._plugins['kinetic']) {
                        // Set autoDraw policy as requested
                        options = {kinetic:{ autoDraw : autoDraw }};
                    } else {
                        // AutoDraw is supported only with the kinetic plugin
                        autoDraw = false;
                    }
                    TweenLite.set(dragTarget, _({
                        onUpdate : function() {
                            dragTarget.setAbsolutePosition(newNodePos);
                            // We should fire DRAGMOVE onComplete to be correct.
                            // However DRAGMOVE listeners may have something to
                            // draw themselves, so we give them a chance to chime in.
                            target.fire(events.DRAGMOVE, evt, true);
                            if(!autoDraw) dragTarget.getLayer().batchDraw();
                        }
                    }).extend(options));
                }
                // Otherwise batchDraw the layer. Kinetic uses a dedicated animation
                // for DD but for now we just piggy-back the batchDraw animation
                else {
                    dragTarget.setAbsolutePosition(newNodePos);
                    target.fire(events.DRAGMOVE, evt, true);
                    dragTarget.getLayer().batchDraw();
                }

            }

            // dragend ('end') callback
            function onDragEnd(point) {
                // Nothing to do if we were not dragging (this can happen if a drag on the same target has been skipped)
                if(!dragging) return;

                // Unmark dragTarget as multi-touch dragging
                dragTarget._mtdragging = false;
                dragging = false;
                // Fire event
                target.fire(events.DRAGEND, toEvent(point), true);
                // Cleanup
                target = dragTarget = null;
            }

        }
    });

    // Export as Kinetic.MultiTouch. Add event names so they can be referenced in user code (in case they change)
    Kinetic.MultiTouch = _(Kinetic.MultiTouch || {}).extend(events);

    // Add multi-touch Kinetic extension. Takes an option object like Kinetic.Stage does with the following additions:
    //  - multitouch : <boolean>, default 'false'
    //                       Enable multitouch by default on the stage and its children. If this is undefined or set to false
    //                       multi-touch events are not captured and triggered by default (and you must enable them on the nodes you want)
    //  - disableSingleTouch: <boolean>, default 'false'
    //                       Prevent kinetic from registering its own single-touch events.
    //                       This forces you to use only multitouch events only as Kinetic will not
    //                       fire its own touch/mouse events any longer, but it provides better performance
    Kinetic.MultiTouch.Stage = function(config) {
        // Prevent Kinetic from registering its own events if disableSingleTouch is passed in the options
        this.disableSingleTouch = config.disableSingleTouch;
        Kinetic.Stage.call(this, config);
        // Get content
        var content = this.getContent();
        // Apply Touchy
        Touchy(content, !supportsTouch, {
            kinetic: {
                stage : this,
                // Default autodraw behaviour if GSAP+KineticPlugin are used
                // This can be overriden by each node and it's ignored
                // if GSAP and/or KineticPlugin are not used
                autoDraw : true
            }
        });
    }
    // Override _bindContentEvents, so we can prevent Kinetic from registering its own
    // content events if the Stage has been configured with disableSingleTouch
    Kinetic.MultiTouch.Stage.prototype._bindContentEvents = function() {
        if(!this.disableSingleTouch) {
            Kinetic.Stage.prototype._bindContentEvents.apply(this, arguments);
        } else {
            // Prevent the content from moving when dragged
            this.getContent().addEventListener('touchmove', preventDefault, false);
        }
    }
    Kinetic.Util.extend(Kinetic.MultiTouch.Stage, Kinetic.Stage);


})(window.Kinetic, window.Touchy);
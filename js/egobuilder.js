/* global $, window */
/* exported EgoBuilder */

module.exports = function EgoBuilder() {
    'use strict';

    var egoBuilder = {};
    var egoBuilderEvents = [];

    var defaultProperties = {};

    egoBuilder.init = function(properties) {

        // Event listeners
        var events = [
            {
                event: 'stageChangeStart',
                handler: egoBuilder.destroy,
                targetEl:  'window.document',
                subTargetEl: ''
            }
        ];
        window.tools.Events.register(egoBuilderEvents, events);

        $.extend(defaultProperties, properties);
    };

    egoBuilder.destroy = function() {
        window.tools.Events.unbind(egoBuilderEvents);
    };

    return egoBuilder;
};

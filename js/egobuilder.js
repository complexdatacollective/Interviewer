/* global $ */
/* exported EgoBuilder */

module.exports = function EgoBuilder() {
    'use strict';

    var egoBuilder = {};
    var egoBuilderEvents = [];

    var defaultProperties = {};

    var registerEvents = function(eventsArray, eventsList) {
        for (var i = 0; i < eventsList.length; i++) {
            eventsArray.push(eventsList[i]);
            $(eventsList[i].targetEl).on(eventsList[i].event, eventsList[i].handler);
        }

    };

    var unbindEvents = function(eventsArray) {
        for (var i = 0; i < eventsArray.length; i++) {
            $(eventsArray[i].targetEl).off(eventsArray[i].event, eventsArray[i].handler);
        }
    };

    egoBuilder.init = function(properties) {

        // Event listeners
        var events = [
            {
                event: 'stageChangeStart',
                handler: egoBuilder.destroy,
                targetEl:  'window.document',
                subTargetEl: ''
            },
            {
                event: 'click',
                handler: test,
                targetEl:  '.blah',
                subTargetEl: ''
            }
        ];
        registerEvents(egoBuilderEvents, events);

        $.extend(defaultProperties, properties);
    };

    egoBuilder.destroy = function() {
        unbindEvents(egoBuilderEvents);
    };

    return egoBuilder;
};

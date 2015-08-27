/* exported Logger */
/* global window, note */

var Logger = function Logger() {
    'use strict';
    var logger = {};

    // todo: add custom events so that other scripts can listen for log changes (think vis).

    logger.init = function() {
        note.info('Logger initialising.');

        window.log = window.netCanvas.Modules.session.registerData('log', true);

        // listen for log events
        window.addEventListener('log', function (e) {
            logger.addToLog(e.detail);
        }, false);

        return true;
    };

    logger.addToLog = function(e) {
        if (!e) { return false; }

        var data = {
            'eventType': e.eventType,
            'targetObject':e.eventObject,
            'eventTime': new Date()
        };

        window.netCanvas.Modules.session.addData('log', data, true);
        var eventLogged = new window.CustomEvent('eventLogged', {'detail':data});
        window.dispatchEvent(eventLogged);
        var unsavedChanges = new window.Event('unsavedChanges');
        window.dispatchEvent(unsavedChanges);
        return true;
    };

    logger.getLog = function() {
        return window.log;
    };

    logger.getLastEvent = function() {

    };

    return logger;
};

module.exports = new Logger();

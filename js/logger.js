/* exported Logger */
/* global session, notify */

var Logger = function Logger() {

  var logger = {}; 

  // todo: add custom events so that other scripts can listen for log changes (think vis).

  logger.init = function() {
    notify('Logger initialising.', 1);

    window.log = session.registerData('log', true);

    // listen for log events
    window.addEventListener('log', function (e) { 
      logger.addToLog(e.detail);
    }, false);

    return true;
  };

  logger.addToLog = function(e) {
    notify("Event being added to log.",1);
    if (!e) { return false; }

    var data = {
      'eventType': e.eventType,
      'targetObject':e.eventObject,
      'eventTime': new Date()
    };
    // var humanDate = date.toString('H:mm:ss');
    // window.log.push(data);
    session.addData('log', data, true);
    var eventLogged = new CustomEvent('eventLogged', {"detail":data});
    window.dispatchEvent(eventLogged);
    var unsavedChanges = new Event('unsavedChanges');
    window.dispatchEvent(unsavedChanges);
    return true;
  };

  logger.getLog = function() {
    return window.log;
    
  };

  logger.getLastEvent = function() {
    
  };

  logger.init();

  return logger;
};
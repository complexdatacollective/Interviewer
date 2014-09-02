/* exported Logger */
/* global session */

var Logger = function Logger() {

  var logger = {};
  window.log = session.registerData('log', true); 

  // todo: add custom events so that other scripts can listen for log changes (think vis).

  logger.init = function() {

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
    // var humanDate = date.toString('H:mm:ss');
    window.log.push(data);
    var eventLogged = new CustomEvent('eventLogged', {"detail":data});
    window.dispatchEvent(eventLogged);
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
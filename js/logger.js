/* exported Logger */
/* global session */

var Logger = function Logger() {

  var logger = {};
  window.log = session.registerData('log', true); 

  // todo: add custom events so that other scripts can listen for log changes (think vis).

  logger.init = function() {

    // listen for log events
    window.addEventListener('log', function (e) { 
      logger.addToLog(e);
    }, false);

    return true;
  };

  logger.addToLog = function(type,e,id) {
    if (!e && !type) { return false; }
    var date = new Date();
    // var humanDate = date.toString('H:mm:ss');
    var data = {
      timestamp: date,
      eventType: type,
      eventValue: e,
      objectID: id
    };
    window.log.push(data);
    session.addData('log',window.log);
    var eventLogged = new Event('eventLogged', {'eventType': data.eventType,'eventTime':data.timestamp, 'targetObject':data.objectID, 'eventValue': e});
    window.dispatchEvent(eventLogged);
    return true;
  };

  logger.getLog = function() {
    
  };

  logger.getLastEvent = function() {
    
  };  

  return logger;
};
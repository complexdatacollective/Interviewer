/* exported Logger */
/* global notify */

var Logger = function Logger() {

  var logger = {};
  var log = [];

  // todo: add custom events so that other scripts can listen for log changes (think vis).

  logger.init = function() {
    return true;
  };

  logger.addToLog = function(type,e,id) {
    if (!e && !type) { return false; }
    var date = new Date();
    var humanDate = date.toString('H:mm:ss');
    var data = {
      timestamp: date,
      eventType: type,
      eventValue: e,
      objectID: id
    };
    log.push(data);
    notify("Logged "+data.eventType+" on object "+data.objectID+" at time point "+humanDate,1);
    return true;
  };

  logger.getLog = function() {
    return log;
  };

  logger.getLastEvent = function() {
    return log[log.length-1];
  };  

  return logger;
};
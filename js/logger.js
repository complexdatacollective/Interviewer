/* exported Logger */
/* global notify */

var Logger = function Logger() {

  var logger = {};
  var log = [];

  logger.init = function() {
    return true;
  };

  logger.addToLog = function(type,d,id) {
    if (!d && !type) { return false; }
    var date = new Date();
    var humanDate = date.toString('H:mm:ss');
    var data = {};
    data.timestamp = date;
    data.eventType = type;
    data.eventValue = d;
    data.objectID = id;
    log.push(data);
    notify("Logged "+data.eventType+" on object "+data.objectID+" at time point "+humanDate,2);
    return true;
  };

  logger.getLog = function() {
    return log;
  };

  return logger;
};
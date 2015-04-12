global.gui = require('nw.gui');
var moment = require('moment');
var fs = require('fs');
var path = require('path');

console.log("netCanvas "+global.gui.App.manifest.version+" running on NWJS "+process.versions['node-webkit']);

fs.readdir(path.join(path.resolve(), 'protocols'), function(err, files) {
    if (err) { console.log(err); return false; }
    console.log("Available survey protocols:");
    console.log(files);
});

// var win = global.gui.Window.get().enterFullscreen();

// Set the global debug level
global.debugLevel = 10;

// Set the global survey
// To do: check if this protocol exists elsewhere.
global.studyProtocol = "RADAR";

// Require tools
global.tools = require('./js/tools');

// Initialise the menu system – other modules depend on it being there.
global.menu = require('./js/menu');

// Initialise datastore
global.dataStore = require('./js/iointerface');

// Initialise logger
global.logger = require('./js/logger');

// Set up a new session
global.session = require('./js/session');

// Create a log
global.eventLog = require('./js/logger');

// Build a new network
global.network = require('./js/network');

// Initialise session now everything is loaded
global.session.init();
global.logger.init();

$('.arrow-next').click(function() {
    global.session.nextStage();
});
$('.arrow-prev').click(function() {
    global.session.prevStage();
});



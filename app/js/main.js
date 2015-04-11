var gui = require('nw.gui');
var moment = require('moment');
var fs = require('fs');
var path = require('path');

fs.readdir(path.join(path.resolve(), 'surveys'), function(err, files) {
    if (err) { console.log('error'); return false; }
    console.log("Available surveys:");
    console.log(files);
});

// var win = gui.Window.get().enterFullscreen();

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

// Set up a new session
global.session = require('./js/session');

// Create a log
global.eventLog = require('./js/logger');

// Build a new network
global.network = require('./js/network');

// Initialise session now everything is loaded
global.session.init();

$('.arrow-next').click(function() {
    session.nextStage();
});
$('.arrow-prev').click(function() {
    session.prevStage();
});

/* global global, $, L */

'use strict';

global.$ = $;
global.L = L;

global.gui = require('nw.gui');
var moment = require('moment');
global.moment = moment; // needed for module access.
var fs = require('fs');
var path = require('path');
var devMode = false;
global.debugLevel = 10;
// Set the global survey
global.studyProtocol = 'RADAR';


$('.refresh-button').on('click', function() {
    console.log('yo');
    var _window = global.gui.Window.get();
    _window.reloadDev();
});

console.log('netCanvas '+global.gui.App.manifest.version+' running on NWJS '+process.versions['node-webkit']);

var protocolExists = function(protocol, callback) {
    var response = false;
    var availableProtocols = [];
    // Print out available survey protocols.
    fs.readdir(path.join(path.resolve(), 'protocols'), function(err, files) {
        if (err) { console.log(err); return false; }
        console.log('Available survey protocols:');
        files.forEach(function(file) {
            var stats = fs.statSync(path.join(path.resolve(), 'protocols', file));
            if (stats.isDirectory()) {
                console.log(file);
                availableProtocols.push(file);
            }
        });

        if (availableProtocols.indexOf(protocol) !== -1) {
            response = true;
        }

        if (callback) { callback(response); }
    });
};

// Detect dev mode
var args = global.gui.App.argv;

// Just futureproofing in case this changes in future nw versions.
if (typeof args !== 'undefined' && args.indexOf('dev') !== -1) {
    console.log('Development mode enabled.');
    devMode = true;
}

if (devMode) {
    global.gui.Window.get().showDevTools();
    $('.refresh-button').show();
    global.debugLevel = 1;
} else {
    $('.refresh-button').hide();
    global.gui.Window.get().enterFullscreen();
}

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





// to do: expand this function to validate a proposed session, not just check that it exists.
protocolExists(global.studyProtocol, function(exists){
    if (!exists) {
        console.log('WARNING: Specified study protocol was not found. Using default.');
        global.studyProtocol = 'default';
    }
    // Initialise session now.
    global.session.loadProtocol();
    global.session.init();
    global.logger.init();

});

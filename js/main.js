/* global window, nodeRequire, FastClick, document, Konva, $, L */
'use strict';

window.$ = $;
window.L = L;
window.Konva = Konva;
window.gui = {};
window.netCanvas = {};


window.isNode = (typeof process !== 'undefined' && typeof require !== 'undefined');
window.isCordova = document.URL.indexOf('http://') === -1 && document.URL.indexOf('https://') === -1;
window.isNodeWebkit = false;
var moment = require('moment');
window.moment = moment; // needed for module access.
window.netCanvas.devMode = false;
window.netCanvas.debugLevel = 10;
// Set the window survey
window.netCanvas.studyProtocol = 'default';

//Is this Node.js?
if(window.isNode) {
    //If so, test for Node-Webkit
    try {
        window.isNodeWebkit = (typeof nodeRequire('nw.gui') !== 'undefined');
        window.isNodeWebkit = true;
    } catch(e) {
        window.isNodeWebkit = false;
    }
}

// Arguments
// build an associative array (argument => value) for command line arguments independant of platform

function getArguments() {
    var args = false;
    if (window.isNodeWebkit) {
        window.gui = nodeRequire('nw.gui');
        args = window.gui.App.argv;

        return args;
    } else if (window.isCordova) {
        // what can we do here?
    } else {
        // browser
        var match,
        pl     = /\+/g,  // Regex for replacing addition symbol with a space
        search = /([^&=]+)=?([^&]*)/g,
        decode = function (s) { return decodeURIComponent(s.replace(pl, ' ')); },
        query  = window.location.search.substring(1);

        args = {};
        while ((match = search.exec(query))) {
            args[decode(match[1])] = decode(match[2]);
        }

        return args;
    }
}


var args = getArguments();
// Enable/disable dev mode
if (args && args.dev !== -1) {
    console.log('Development mode enabled.');
    window.netCanvas.devMode = true;
}






$('.refresh-button').on('click', function() {
    console.log('yo');
    var _window = window.gui.Window.get();
    _window.reloadDev();
});

if (window.isNodeWebkit) {
    console.log('netCanvas '+window.gui.App.manifest.version+' running on NWJS '+process.versions['node-webkit']);
}


var protocolExists = function(protocol, callback) {
    var response = false;
    var availableProtocols = ['RADAR', 'default', 'dphil-protocol'];

    if (availableProtocols.indexOf(protocol) !== -1) {
        response = true;
    }

    callback(response);
};

// Just futureproofing in case this changes in future nw versions.
if (window.isNodeWebkit && window.gui.App.argv.indexOf('dev') !== -1) {
    console.log('Development mode enabled.');
    window.netCanvas.devMode = true;
}

if (window.netCanvas.devMode) {
    if (window.isNodeWebkit) {
        window.gui.Window.get().showDevTools();
    }
    $('.refresh-button').show();
    window.netCanvas.debugLevel = 1;
} else {
    $('.refresh-button').hide();
    if (window.isNodeWebkit) {
        window.gui.Window.get().enterFullscreen();
    }
}

// Require tools
window.tools = require('./tools');

// Interface Modules
window.netCanvas.Modules = {};
window.netCanvas.Modules.Network = require('./network.js');
window.netCanvas.Modules.NameGenerator = require('./namegenerator.js');
window.netCanvas.Modules.DateInterface = require('./dateinterface.js');
window.netCanvas.Modules.OrdBin = require('./ordinalbin.js');
window.netCanvas.Modules.IOInterface = require('./iointerface.js');
window.netCanvas.Modules.GeoInterface = require('./map.js');
window.netCanvas.Modules.RoleRevisit = require('./rolerevisit.js');
window.netCanvas.Modules.ListSelect = require('./listselect.js');
window.netCanvas.Modules.MultiBin = require('./multibin.js');
window.netCanvas.Modules.Sociogram = require('./sociogram.js');

// Initialise the menu system – other modules depend on it being there.
window.menu = require('./menu.js');

// Initialise datastore
window.dataStore = require('./iointerface.js');

// Initialise logger
window.logger = require('./logger.js');

// Set up a new session
window.netCanvas.Modules.session = require('./session.js');

// to do: expand this function to validate a proposed session, not just check that it exists.
protocolExists(window.netCanvas.studyProtocol, function(exists){
    if (!exists) {
        console.log('WARNING: Specified study protocol was not found. Using default.');
        window.netCanvas.studyProtocol = 'default';
    }
    // Initialise session now.
    window.netCanvas.Modules.session.init(function() {
        window.netCanvas.Modules.session.loadProtocol();
    });
    window.logger.init();
    if ('addEventListener' in document) {
        document.addEventListener('DOMContentLoaded', function() {
            FastClick.attach(document.body);
        }, false);
    }

});

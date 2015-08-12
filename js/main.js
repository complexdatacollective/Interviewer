/* global window, nodeRequire, FastClick, document, Konva, $, L */
$(document).ready(function() {
    'use strict';

    window.$ = $;
    window.L = L;
    window.Konva = Konva;
    window.gui = {};
    window.netCanvas = {};


    window.isNode = (typeof process !== 'undefined' && typeof require !== 'undefined'); // this check doesn't work, because browserify tries to be clever.
    window.isCordova = !!window.cordova;
    window.isNodeWebkit = false;
    var moment = require('moment');
    window.moment = moment; // needed for module access.
    window.netCanvas.devMode = false;
    window.netCanvas.debugLevel = 0;
    window.netCanvas.studyProtocol = 'dphil-protocol';

    //Is this Node.js?
    if(window.isNode) {
        //If so, test for Node-Webkit
        try {
            window.isNodeWebkit = (typeof nodeRequire('nw.gui') !== 'undefined');
            window.gui = nodeRequire('nw.gui');
            window.isNodeWebkit = true;
        } catch(e) {
            window.isNodeWebkit = false;
        }
    }

    // Arguments
    /** build an object (argument: value) for command line arguments independant of platform **/
    window.getArguments = function() {
        var args = false;
        if (window.isNodeWebkit) {
            args = window.gui.App.argv;
            var newArgs = {};
            for (var i= 0; i < args.length; i++) {
                if (args[i].indexOf('--') === 0) { // Argument begins with --
                    var currentArg = args[i].substring(2);
                    currentArg = currentArg.split('=');
                    // remove quotes around strings
                    if (currentArg[1].charAt(0) === '"' && currentArg[1].charAt(currentArg[1].length -1) === '"') {
                        currentArg[1] = currentArg[1].substr(1,currentArg[1].length -2);
                    }
                    newArgs[currentArg[0]] = currentArg[1];
                }
            }
            return newArgs;
        } else if (window.isCordova) {
            // what can we do here?
            return args;
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
    };

    var args = window.getArguments();

    // Enable dev mode.
    if (args && (args.dev === 'true' || args.dev === '1')) {
        console.log('Development mode enabled.');
        window.netCanvas.devMode = true;
        if (window.isNodeWebkit) {
            window.gui.Window.get().showDevTools();
        } else {
            // no way to show dev tools on web browser
        }
        $('.refresh-button').show();
        window.netCanvas.debugLevel = 1;
    } else {
        $('.refresh-button').hide();
        if (window.isNodeWebkit) {
            window.gui.Window.get().enterFullscreen();
        } else {
            // no way to enter full screen automatically on web browser.
            // could show button or prompt?
        }
    }


    $('.refresh-button').on('click', function() {
        if(window.isNodeWebkit) {
            var _window = window.gui.Window.get();
            _window.reloadDev();
        } else if (window.isCordova) {
            window.location.reload();
        } else {
            window.location.reload();
        }

    });


    // print some version stuff
    if (window.isNodeWebkit) {
        var version = window.process.versions['node-webkit'];
        console.log('netCanvas '+window.gui.App.manifest.version+' running on NWJS '+version);
    } else if (window.isCordova) {
        // can we get meaningful version info on cordova? how about a get request to the package.json?
        console.log('netCanvas running on cordova '+window.cordova.version+' on '+window.cordova.platformId);
    } else {
        // anything we can do in browser? yes.
    }

    var protocolExists = function(protocol, callback) {
        var response = false;
        var availableProtocols = ['RADAR', 'default', 'dphil-protocol'];

        if (availableProtocols.indexOf(protocol) !== -1) {
            response = true;
        }

        callback(response);
    };

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
    window.netCanvas.Modules.EgoBuilder = require('./egobuilder.js');
    window.netCanvas.Modules.FormBuilder = require('./formbuilder.js');
    window.netCanvas.Modules.ContextGenerator = require('./contextgenerator.js');

    // Initialise the menu system – other modules depend on it being there.
    window.menu = require('./menu.js');

    // Initialise datastore
    window.dataStore = require('./iointerface.js');

    // Initialise logger
    window.logger = require('./logger.js');

    // Set up a new session
    window.netCanvas.Modules.session = require('./session.js');


    // study protocol
    if (args && typeof args.protocol !== 'undefined') {
        window.netCanvas.studyProtocol = args.protocol;
    }

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

});

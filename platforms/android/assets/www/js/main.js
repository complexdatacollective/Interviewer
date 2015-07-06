/* global window, Konva, $, L */
    'use strict';

    window.$ = $;
    window.L = L;
    window.Konva = Konva;

    window.gui = {};
    var moment = require('moment');
    window.moment = moment; // needed for module access.
    var fs = require('browserify-fs');
    var path = require('path');
    var devMode = true;
    window.debugLevel = 10;
    // Set the window survey
    window.studyProtocol = 'RADAR';


    $('.refresh-button').on('click', function() {
        console.log('yo');
        var _window = window.gui.Window.get();
        _window.reloadDev();
    });

    // console.log('netCanvas '+window.gui.App.manifest.version+' running on NWJS '+process.versions['node-webkit']);

    var protocolExists = function(protocol, callback) {
        var response = false;
        // var availableProtocols = [];
        // // Print out available survey protocols.
        // fs.readdir('../protocols/', function(err, files) {
        //     if (err) {
        //         console.log(err);
        //         response = false;
        //         if (callback) { callback(response); }
        //         return false;
        //     }
        //     console.log('Available survey protocols:');
        //     files.forEach(function(file) {
        //         var stats = fs.statSync(path.join(path.resolve(), 'protocols', file));
        //         if (stats.isDirectory()) {
        //             console.log(file);
        //             availableProtocols.push(file);
        //         }
        //     });
        //
        //     if (availableProtocols.indexOf(protocol) !== -1) {
        //         response = true;
        //     }
        //
        //     if (callback) { callback(response); }
        // });

        callback(response);
    };

    // Detect dev mode
    // var args = window.gui.App.argv;

    // Just futureproofing in case this changes in future nw versions.
    if (typeof args !== 'undefined' && args.indexOf('dev') !== -1) {
        console.log('Development mode enabled.');
        devMode = true;
    }

    if (devMode) {
        // window.gui.Window.get().showDevTools();
        $('.refresh-button').show();
        window.debugLevel = 1;
    } else {
        $('.refresh-button').hide();
        // window.gui.Window.get().enterFullscreen();
    }

    // Require tools
    window.tools = require('./tools');

    // Initialise the menu system – other modules depend on it being there.
    window.menu = require('./menu');

    // Initialise datastore
    window.dataStore = require('./iointerface');

    // Initialise logger
    window.logger = require('./logger');

    // Set up a new session
    window.session = require('./session');

    // Create a log
    window.eventLog = require('./logger');

    // to do: expand this function to validate a proposed session, not just check that it exists.
    protocolExists(window.studyProtocol, function(exists){
        if (!exists) {
            console.log('WARNING: Specified study protocol was not found. Using default.');
            window.studyProtocol = 'default';
        }
        // Initialise session now.
        window.session.init(function() {
            window.session.loadProtocol();
        });
        window.logger.init();

    });

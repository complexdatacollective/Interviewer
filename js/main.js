/* global window, Konva, $, L */
    'use strict';

    window.$ = $;
    window.L = L;
    window.Konva = Konva;
    window.gui = {};
	window.netCanvas = {};


    var isNode = (typeof process !== "undefined" && typeof require !== "undefined");
    var isCordova = document.URL.indexOf('http://') === -1 && document.URL.indexOf('https://') === -1;
    var isNodeWebkit = false;

    //Is this Node.js?
    if(isNode) {
      //If so, test for Node-Webkit
      try {
        isNodeWebkit = (typeof nodeRequire('nw.gui') !== "undefined");
        window.gui = nodeRequire('nw.gui');
        isNodeWebkit = true;
      } catch(e) {
        isNodeWebkit = false;
      }
    }



    var moment = require('moment');
    window.moment = moment; // needed for module access.
    var fs = require('browserify-fs');
    var path = require('path');
    window.netCanvas.devMode = false;
    window.netCanvas.debugLevel = 10;
    // Set the window survey
    window.netCanvas.studyProtocol = 'RADAR';


    $('.refresh-button').on('click', function() {
        console.log('yo');
        var _window = window.gui.Window.get();
        _window.reloadDev();
    });

    // console.log('netCanvas '+window.gui.App.manifest.version+' running on NWJS '+process.versions['node-webkit']);

    var protocolExists = function(protocol, callback) {
        var response = false;
        var availableProtocols = ['RADAR', 'default'];

		if (availableProtocols.indexOf(protocol) !== -1) {
			response = true;
		}

        callback(response);
    };

    // Just futureproofing in case this changes in future nw versions.
    if (isNodeWebkit && window.gui.App.argv.indexOf('dev') !== -1) {
        console.log('Development mode enabled.');
        window.netCanvas.devMode = true;
    }

    if (window.netCanvas.devMode) {
        if (isNodeWebkit) {
            window.gui.Window.get().showDevTools();
        }
        $('.refresh-button').show();
        window.netCanvas.debugLevel = 1;
    } else {
        $('.refresh-button').hide();
        if (isNodeWebkit) {
            window.gui.Window.get().enterFullscreen();
        }
    }

    // Require tools
    window.tools = require('./tools');

	// Interface Modules
    window.netCanvas.Modules = {};
	window.netCanvas.Modules.Network = require('./network.js');
    window.netCanvas.Modules.NameGenerator = require('./namegenerator.js');
	window.netCanvas.Modules.OrdBin = require('./ordinalbin.js');
	window.netCanvas.Modules.IOInterface = require('./iointerface.js');
	window.netCanvas.Modules.Map = require('./map.js');
	window.netCanvas.Modules.RoleRevisit = require('./rolerevisit.js');
	window.netCanvas.Modules.ListSelect = require('./listselect.js');
	window.netCanvas.Modules.MultiBin = require('./multibin.js');
	window.netCanvas.Modules.Sociogram = require('./sociogram.js');

    // Initialise the menu system – other modules depend on it being there.
    window.menu = require('./menu.js');;

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

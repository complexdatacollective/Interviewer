/* global document, window, $, console */
/* exported Session, eventLog */
var Session = function Session() {
    'use strict';
    //global vars
    var session = {};
    var currentStage = 0;
    var content = $('#content');
    session.id = 0;
    session.sessionData = {};
    var lastSaveTime, saveTimer;

    function saveFile(path) {
        var data = JSON.stringify(session.sessionData, undefined, 2);
        var fs = require('fs');
        fs.writeFile(path, data);
    }

    function clickDownloadInput() {
        $('#save').prop('nwsaveas', session.returnSessionID()+'_'+Math.floor(Date.now() / 1000)+'.json');
        var event = window.document.createEvent('MouseEvents');
        event.initMouseEvent('click');
        window.document.getElementById('save').dispatchEvent(event);
    }

    // custom events
    session.options = {
        fnBeforeStageChange : function(oldStage, newStage) {
            var eventProperties = {
                stage: currentStage,
                timestamp: new Date()
            };
            var log = new window.CustomEvent('log', {'detail':{'eventType': 'stageCompleted', 'eventObject':eventProperties}});
            window.dispatchEvent(log);

            var changeStageStartEvent = new window.CustomEvent('changeStageStart', {'detail':{oldStage: oldStage, newStage: newStage}});
            window.dispatchEvent(changeStageStartEvent);

        },
        fnAfterStageChange : function(oldStage, newStage) {
            session.sessionData.sessionParameters.stage = newStage;
            var changeStageEndEvent = new window.CustomEvent('changeStageEnd', {'detail':{oldStage: oldStage, newStage: newStage}});
            window.dispatchEvent(changeStageEndEvent);
            if ((currentStage+1) === session.stages.length) {
                $('.arrow-next').hide();
            } else if (currentStage === 0) {
                $('.arrow-prev').hide();
            } else {
                $('.arrow-next').show();
                $('.arrow-prev').show();
            }
        }
    };

    session.loadProtocol = function() {
        var path = require('path');

        // Require the session protocol file.
        var studyPath = path.normalize('../protocols/'+global.studyProtocol+'/protocol.js');
        var study = require(studyPath);

        // copy the stages
        session.stages = study.stages;

        // insert the stylesheet
        $('head').append('<link rel="stylesheet" href="protocols/'+global.studyProtocol+'/css/style.css" type="text/css" />');

        // copy the skip functions
        session.skipFunctions = study.skipFunctions;

        // set the study name (used for database name)
        session.name = study.sessionParameters.name;
    };

    session.init = function() {
        global.tools.notify('Session initialising.', 1);

        // register session key
        session.parameters = session.registerData('sessionParameters', true);

        // Navigation arrows.
        $('.arrow-next').on('click', function() {
            global.session.nextStage();
        });

        $('.arrow-prev').on('click',function() {
            global.session.prevStage();
        });

        //bind to the custom state change event to handle spinner interactions
        window.addEventListener('changeStageStart', function () {
            $('.loader').transition({opacity:1});
        }, false);

        window.addEventListener('changeStageEnd', function () {
            $('.loader').transition({opacity:0});
        }, false);

        window.document.getElementById('save').addEventListener('change', function () {
            saveFile(this.value);
        });

        // Check for an in-progress session
        global.dataStore.init(function(sessionid) {
            session.id = sessionid;
            global.dataStore.load(function(data) {
                session.updateSessionData(data);
                if (typeof session.sessionData.sessionParameters.stage !== 'undefined') {
                    session.goToStage(session.sessionData.sessionParameters.stage);
                } else {
                    session.goToStage(0);
                }

            }, session.id);
        });

        window.addEventListener('unsavedChanges', function () {
            session.saveManager();
        }, false);

        var sessionMenu = global.menu.addMenu('Session','hi-icon-cog');
        global.menu.addItem(sessionMenu, 'Reset Session', 'icon-globe', function() {
            window.BootstrapDialog.show({
                type: window.BootstrapDialog.TYPE_INFO,
                // size: BootstrapDialog.SIZE_LARGE,
                title: 'Are you sure?',
                message: '<h4>Are you sure you want to reset the session?</h4> <p><strong>IMPORTANT: This will delete any data you have already entered.</strong>',
                buttons: [{
                    label: 'Continue',
                    cssClass: 'btn-modal-success',
                    action: function(){
                        global.dataStore.deleteDocument(session.reset);
                    }
                }, {
                    icon: 'glyphicon glyphicon-ban-circle',
                    label: ' Cancel',
                    cssClass: 'btn-modal-warning',
                    action: function(dialogItself){
                        dialogItself.close();
                    }
                }]
            });
        });

        global.menu.addItem(sessionMenu, 'Download Data', 'icon-briefcase', function() { clickDownloadInput(); });

        global.menu.addItem(sessionMenu, 'Purge Database', 'icon-cloud', function() {
            window.BootstrapDialog.show({
                type: window.BootstrapDialog.TYPE_INFO,
                // size: BootstrapDialog.SIZE_LARGE,
                title: 'Are you sure?',
                message: '<h4>Are you sure you want to purge the database?</h4> <p><strong>IMPORTANT: This will delete any data you have already entered.</strong>',
                buttons: [{
                    label: 'Continue',
                    cssClass: 'btn-modal-success',
                    action: function(){
                        global.dataStore.reset(session.reset);
                    }
                }, {
                    icon: 'glyphicon glyphicon-ban-circle',
                    label: ' Cancel',
                    cssClass: 'btn-modal-warning',
                    action: function(dialogItself){
                        dialogItself.close();
                    }
                }]
            });
        });

        var stagesMenu = global.menu.addMenu('Stages', 'hi-icon-list');
        $.each(session.stages, function(index,value) {
            global.menu.addItem(stagesMenu, value.label, 'icon-play', function() {setTimeout(function() {session.goToStage(index);}, 500); });
        });

    };

    session.downloadData = function() {
        var filename = session.returnSessionID()+'.json';
        var text = JSON.stringify(session.sessionData, undefined, 2); // indentation level = 2;
        var pom = document.createElement('a');
        pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        pom.setAttribute('download', filename);
        pom.click();
    };

    session.reset = function() {
        global.tools.notify('Resetting session.',2);
        session.id = 0;
        session.currentStage = 0;
        var _window = global.gui.Window.get();
        _window.reloadDev();
    };

    session.saveManager = function() {
        clearTimeout(saveTimer);
        saveTimer = setTimeout(session.saveData, 3000);
    };

    session.updateSessionData = function(data) {
        global.tools.notify('Updating user data.', 2);
        global.tools.notify('Using the following to update:', 1);
        global.tools.notify(data, 1);
        global.tools.notify('session.sessionData is:', 1);
        global.tools.notify(session.sessionData, 1);
        global.tools.extend(session.sessionData, data);
        // session.sessionData = $.extend(session.sessionData,data);
        global.tools.notify('Combined output is:', 0);
        global.tools.notify(session.sessionData, 0);

        var newDataLoaded = new window.Event('newDataLoaded');
        window.dispatchEvent(newDataLoaded);
        var unsavedChanges = new window.Event('unsavedChanges');
        window.dispatchEvent(unsavedChanges);
    };

    session.returnSessionID = function() {
        return session.id;
    };

    session.saveData = function() {
        global.dataStore.save(session.sessionData, session.returnSessionID());
        lastSaveTime = new Date();
    };

    session.goToStage = function(stage) {
        if (typeof stage === 'undefined' || typeof session.stages[stage] === 'undefined') {
            return false;
        }

        // Skip logic

        // is there a skip function for this stage?
        if (session.stages[stage].skip) {

            //evaluate skip function
            var outcome = session.stages[stage].skip();

            // if true, skip the stage
            if (outcome === true) {
                console.log('Skipping because skip condition was met.');
                if (stage > currentStage) {
                    session.goToStage(stage+1);
                } else {
                    session.goToStage(stage-1);

                }

                return false;
            }
        }

        global.tools.notify('Session is moving to stage '+stage, 3);

        // Crate stage visible event
        var eventProperties = {
            stage: stage,
            timestamp: new Date()
        };
        var log = new window.CustomEvent('log', {'detail':{'eventType': 'stageVisible', 'eventObject':eventProperties}});
        window.dispatchEvent(log);

        // Fire before stage change event
        session.options.fnBeforeStageChange(currentStage,stage);

        // Transition the content
        var newStage = stage;
        var stagePath ='./protocols/'+global.studyProtocol+'/stages/'+session.stages[stage].page;
        content.transition({opacity: '0'},400,'easeInSine').promise().done( function(){
            content.load( stagePath, function() {
                // This never gets called if there is a JS error. Is there a way to ensure it is?
                content.transition({ opacity: '1'},400,'easeInSine');
            });
        });

        var oldStage = currentStage;
        currentStage = newStage;
        session.options.fnAfterStageChange(oldStage, currentStage);
        var unsavedChanges = new window.Event('unsavedChanges');
        window.dispatchEvent(unsavedChanges);
    };

    session.nextStage = function() {
        session.goToStage(currentStage+1);
    };

    session.prevStage = function() {
        session.goToStage(currentStage-1);
    };

    session.registerData = function(dataKey, isArray) {
        global.tools.notify('A script requested a data store be registered with the key "'+dataKey+'".', 2);
        if (session.sessionData[dataKey] === undefined) { // Create it if it doesn't exist.
            global.tools.notify('Key named "'+dataKey+'" was not already registered. Creating.', 1);
            if (isArray) {
                session.sessionData[dataKey] = [];
            } else {
                session.sessionData[dataKey] = {};
            }
        } else {
            global.tools.notify ('A data store with this key already existed. Returning a reference.',1);
        }
        var unsavedChanges = new window.Event('unsavedChanges');
        window.dispatchEvent(unsavedChanges);
        return session.sessionData[dataKey];
    };

    session.addData = function(dataKey, newData, append) {
        /*
        This function should let any module add data to the session model. The session model
        (global data variable) is essentially a key/value store.
        */

        if (!append) { append = false; }

        if (append === true) { // this is an array
            session.sessionData[dataKey].push(newData);
        } else {
            global.tools.extend(session.sessionData[dataKey], newData);
        }

        global.tools.notify('Adding data to key "'+dataKey+'".',2);
        global.tools.notify(newData, 1);
        var unsavedChanges = new window.Event('unsavedChanges');
        window.dispatchEvent(unsavedChanges);

    };

    session.currentStage = function() {
        return currentStage;
    };

    session.returnData = function(dataKey) {
        if (!dataKey) {
            return session.sessionData;
        } else if (typeof session.sessionData[dataKey] !== 'undefined') {
            return session.sessionData[dataKey];
        } else {
            return session.sessionData;
        }
    };

    return session;
};

module.exports = new Session();

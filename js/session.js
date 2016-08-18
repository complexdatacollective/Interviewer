/* global document, window, $, protocol, nodeRequire, note */
/* exported Session, eventLog */
var Session = function Session() {
    'use strict';
    //window vars
    var session = {};
    var currentStage = 0;
    var content = $('#content');
    var key = 'N3"u6tH@2wH9UM205niU=45J7y<(3=OC{2<:Lb+KqD2HG9!f6{VVL#&2/Mt+lV3';
    session.id = 0;
    var navigationDisabled = false;
    var allowedStages = [0]; //We can always go back to the intro screen;
    session.sessionData = {};
    var lastSaveTime, saveTimer;

    function saveFile(path) {
        if (window.isNodeWebkit) {
            var data = JSON.stringify(session.sessionData, undefined, 2);
            var fs = nodeRequire('fs');
            fs.writeFile(path, data);
        } else {
            note.warn('saveFile() is not yet implemented on this platform!');
        }

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

        // Require the session protocol file.
        // var studyPath = path.normalize('../protocols/'+window.studyProtocol+'/protocol.js');
        $.getScript( 'protocols/'+window.netCanvas.studyProtocol+'/protocol.js', function() {
            window.protocolPath = 'protocols/'+window.netCanvas.studyProtocol+'/';
            // protocol.js files declare a protocol variable, which is what we use here.
            // It is implicitly loaded as part of the getScript callback
            var study = protocol;

            session.parameters = session.registerData('sessionParameters');
            session.updateSessionData({sessionParameters:study.sessionParameters});
            // copy the stages
            session.stages = study.stages;
            session.protocolData = study.data;

            // insert the stylesheet
            $('head').append('<link rel="stylesheet" href="protocols/'+window.netCanvas.studyProtocol+'/css/style.css" type="text/css" />');

            // copy the skip functions
            session.skipFunctions = study.skipFunctions;

            // set the study name (used for database name)
            if (study.sessionParameters.name) {
                session.name = study.sessionParameters.name;
            } else {
                note.error('Study protocol must have key "name" under sessionParameters.');
            }


            // Check for an in-progress session
            window.dataStore.init(function(sessionid) {
                session.id = sessionid;
                window.dataStore.load(function(data) {

                    session.updateSessionData(data, function() {
                        // Only load the network into the model if there is a network to load
                        if(session.sessionData.nodes && session.sessionData.edges) {
                            window.network.loadNetwork({nodes:session.sessionData.nodes,edges:session.sessionData.edges});
                        }

                        if (typeof session.sessionData.sessionParameters.stage !== 'undefined') {
                            session.goToStage(session.sessionData.sessionParameters.stage);
                        } else {
                            session.goToStage(0);
                        }
                    });
                }, session.id);
            });

            // Initialise the menu system – other modules depend on it being there.
            var stagesMenu = window.menu.addMenu('Stages', 'bars');
            $.each(session.stages, function(index,value) {
                var icon = null;
                if (value.icon) {
                    icon = value.icon;
                }
                window.menu.addItem(stagesMenu, value.label, icon, function() {setTimeout(function() {session.goToStage(index);}, 500); });
            });
        }).fail(function( jqxhr, textStatus, error ) {
            var err = textStatus + ', ' + error;
            note.error('Error fetching protocol!');
            note.trace(err);
        });

    };

    session.nextHandler = function() {
        session.nextStage();
    };

    session.previousHandler = function() {
        var visitNumber = window.network.getEgo().visit_number;
        if (currentStage === 2 && visitNumber > 1) {
            window.BootstrapDialog.show({
                type: window.BootstrapDialog.TYPE_DANGER,
                // size: BootstrapDialog.SIZE_LARGE,
                title: '',
                message: '<h3>WARNING!</h3> <p>Going backwards from this step will take you to the initial screen. Changing the RADAR ID or visit number on this screen may require you to reset the session, thereby deleting all current data.</p><h4>Continue?</h4>',
                buttons: [{
                    label: 'Continue',
                    cssClass: 'btn-modal-success',
                    action: function(dialogItself){
                        session.prevStage();
                        dialogItself.close();
                    }
                }, {
                    label: 'Cancel',
                    cssClass: 'btn-modal-danger',
                    action: function(dialogItself){
                        dialogItself.close();
                    }
                }]
            });
        } else {
            session.prevStage();
        }

    };

    session.init = function(callback) {
        note.debug('Session initialising.');
        window.test = setInterval(function(){
            note.debug('checking for data duplication bug...');
            if (window.network.getNodes({id:0}).length > 1) {
                clearInterval(window.test);
                window.BootstrapDialog.show({
                    type: window.BootstrapDialog.TYPE_DANGER,
                    // size: BootstrapDialog.SIZE_LARGE,
                    title: '',
                    message: '<h3>Data Duplication Bug Encountered</h3> <p><strong>IMPORTANT:</strong> You have encountered a known issue with netCanvas whereby interview data has been accidentally duplicated. </p><p><strong>Please note down now exactly what was happening before you saw this message</strong>, and pass this information on at the next team meeting.</p><p>When you are finished, click "Repair Data" to continue with the interview.',
                    buttons: [{
                        label: 'Repair Data',
                        cssClass: 'btn-modal-success',
                        action: function(){
                            window.network.deduplicate();
                            if(window.isNodeWebkit) {
                                var _window = window.gui.Window.get();
                                _window.reloadDev();
                            } else if (window.isCordova) {
                                window.location.reload();
                            } else {
                                window.location.reload();
                            }
                        }
                    }]
                });
            }
        }, 2000);

        // Navigation arrows.
        $('.arrow-next').on('click', window.netCanvas.Modules.session.nextHandler);

        $('.arrow-prev').on('click', window.netCanvas.Modules.session.previousHandler);

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

        // Build a new network
        window.network = new window.netCanvas.Modules.Network();

        window.addEventListener('unsavedChanges', function () {
            session.saveManager();
        }, false);

        var sessionMenu = window.menu.addMenu('Session','cogs');
        window.menu.addItem(sessionMenu, 'Reset Session', 'fa-undo', function() {
            window.BootstrapDialog.show({
                type: window.BootstrapDialog.TYPE_DANGER,
                // size: BootstrapDialog.SIZE_LARGE,
                title: '',
                message: '<h3>Are you sure you want to reset the session?</h3> <p><strong>IMPORTANT:</strong> This will delete all data.',
                buttons: [{
                    label: 'Continue',
                    cssClass: 'btn-modal-success',
                    action: function(){
                        window.dataStore.deleteDocument(session.reset);
                    }
                }, {
                    label: 'Cancel',
                    cssClass: 'btn-modal-danger',
                    action: function(dialogItself){
                        dialogItself.close();
                    }
                }]
            });
        });

        window.menu.addItem(sessionMenu, 'Download Data', 'fa-download', function() { clickDownloadInput(); });

        window.menu.addItem(sessionMenu, 'Purge Database', 'fa-trash', function() {
            window.BootstrapDialog.show({
                type: window.BootstrapDialog.TYPE_DANGER,
                // size: BootstrapDialog.SIZE_LARGE,
                title: '',
                message: '<h3>Are you sure you want to purge the database?</h3><p><strong>IMPORTANT:</strong> This will delete all data.',
                buttons: [{
                    label: 'Continue',
                    cssClass: 'btn-modal-success',
                    action: function(){
                        window.dataStore.reset(session.reset);
                    }
                }, {
                    label: ' Cancel',
                    cssClass: 'btn-modal-danger',
                    action: function(dialogItself){
                        dialogItself.close();
                    }
                }]
            });
        });

        window.menu.addItem(sessionMenu, 'Quit Network Canvas', 'fa-sign-out', function() { window.close(); });

        if(callback) {
            callback();
        }

    };

    session.getPrimaryNetwork = function() {
        return window.network;
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
        note.info('Resetting session.');
        session.id = 0;
        session.currentStage = 0;
        window.netCanvas.Modules.session.enableNavigation();

        if (window.isNodeWebkit) {
            var _window = window.gui.Window.get();
            _window.reloadDev();
        } else {
            window.location.reload();
        }

    };

    session.getSaltedKey = function() {
        return key += session.sessionData.sessionParameters.interviewerID;
    };

    session.encryptSessionData = function(data) {
        if (window.isNodeWebkit) {
            // safe to use node modules.
            var fs = nodeRequire('fs');
            var gui = nodeRequire('nw.gui');
            var saltedKey = session.getSaltedKey();
            var text = JSON.stringify(data, undefined, 2); // indentation level = 2;
            var CryptoJS = require('crypto-js');
            var encrypted = CryptoJS.AES.encrypt(text, saltedKey);
            var path = nodeRequire('path');
            var fileName = Math.floor(Date.now() / 1000).toString();
            var location = path.join(gui.App.dataPath, fileName+'.netCanvas');
            fs.writeFile(location, encrypted, 'utf8', function (err) {
            if (err) {
                throw err;
            }
                return true;
            });
        } else {
            note.warn('session.saveEncryptedData() can only be run from within node webkit.');
            return false;
        }

    };

    session.disableNavigation = function() {
        note.info('disableNavigation');
        navigationDisabled = true;
        // $('.arrow-prev, .arrow-prev').hide();
        $('.arrow-next, .arrow-prev').attr('disabled','disabled');
    };

    session.enableNavigation = function() {
        note.info('enableNavigation');
        navigationDisabled = false;
        $('.arrow-next, .arrow-prev').removeAttr('disabled');
    };

    session.saveManager = function() {
        note.trace('session.saveManager()');
        clearTimeout(saveTimer);
        saveTimer = setTimeout(session.saveData, 3000);
    };

    session.updateSessionData = function(data, callback) {
        note.debug('Updating user data.');
        note.debug('Using the following to update:');
        note.debug(data);


        // Here, we used to simply use our extend method on session.sessionData with the new data.
        // This failed for arrays.
        // Switched to $.extend and added 'deep' as first function parameter for this reason.
        $.extend(true, session.sessionData, data);

        var newDataLoaded = new window.Event('newDataLoaded');
        window.dispatchEvent(newDataLoaded);
        var unsavedChanges = new window.Event('unsavedChanges');
        window.dispatchEvent(unsavedChanges);

        if (callback) {
            callback();
        }
    };

    session.returnSessionID = function() {
        return session.id;
    };

    session.saveData = function() {
        session.sessionData.nodes = window.network.getNodes();
        session.sessionData.edges = window.network.getEdges();

        // handle previous network
        if (typeof window.previousNetwork !== 'undefined') {
            session.sessionData.previousNetwork.nodes = window.previousNetwork.getNodes();
            session.sessionData.previousNetwork.edges = window.previousNetwork.getEdges();
        }

        if(!window.dataStore.initialised()) {
            var unsavedChanges = new window.Event('unsavedChanges');
            window.dispatchEvent(unsavedChanges);
        } else {
            window.dataStore.save(session.sessionData, session.returnSessionID());
        }

        lastSaveTime = new Date();
    };

    session.goToStage = function(stage) {
        if (typeof stage === 'undefined' || typeof session.stages[stage] === 'undefined') {
            return false;
        }

        // Disabled Navigation
        if (allowedStages.indexOf(stage) === -1 && navigationDisabled === true) {
            note.warn('Session navigation is disabled until you complete the current step.');
            return false;
        }

        // If we have got this far, make sure that the navigation is enabled again
        if (session.navigationDisabled === true) { session.enableNavigation(); }

        // Skip logic

        // is there a skip function for this stage?
        if (session.stages[stage].skip) {

            //evaluate skip function
            var outcome = session.stages[stage].skip();

            // if true, skip the stage
            if (outcome === true) {
                if (stage > currentStage) {
                    session.goToStage(stage+1);
                    return false;
                } else {
                    session.goToStage(stage-1);
                    return false;
                }
            }
        }

        note.info('Session is moving to stage '+stage);

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
        var stagePath ='./protocols/'+window.netCanvas.studyProtocol+'/stages/'+session.stages[stage].page;
        content.addClass('stageHidden');
        setTimeout(function(){
            content.load(stagePath, function() {
                setTimeout(function() {
                    content.removeClass('stageHidden');
                }, 200);

            });
        }, 200);

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
        note.info('A script requested a data store be registered with the key "'+dataKey+'".');
        if (typeof session.sessionData[dataKey] === 'undefined') { // Create it if it doesn't exist.
            note.debug('Key named "'+dataKey+'" was not already registered. Creating.');
            if (isArray) {
                session.sessionData[dataKey] = [];
            } else {
                session.sessionData[dataKey] = {};
            }
        } else {
            note.debug('A data store with this key already existed.');
        }
        var unsavedChanges = new window.Event('unsavedChanges');
        window.dispatchEvent(unsavedChanges);
        return session.sessionData[dataKey];
    };

    session.unRegisterData = function(dataKey) {
        if (session.sessionData[dataKey] === undefined) {
            note.error('session.unRegisterData(): the dataKey specified was not found.');
            return false;
        }

        note.debug('session.unRegisterData(): deleting '+dataKey+' from sessionData.');
        delete session.sessionData[dataKey];
        return true;
    };

    session.addData = function(dataKey, newData, append) {
        /*
        This function should let any module add data to the session model. The session model
        (window data variable) is essentially a key/value store.
        */

        // Check if we are appending or overwriting
        if (!append) { append = false; }

        if (append === true) { // this is an array
            session.sessionData[dataKey].push(newData);
        } else {
            window.tools.extend(session.sessionData[dataKey], newData);
        }

        // Notify
        note.debug('Adding data to key "'+dataKey+'".');
        note.debug(newData);

        // Emit an event to trigger data store synchronisation.
        var unsavedChanges = new window.Event('unsavedChanges');
        window.dispatchEvent(unsavedChanges);

        return session.sessionData[dataKey];

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

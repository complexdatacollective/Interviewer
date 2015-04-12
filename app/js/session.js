 /* global console, fs, menu */
/* exported Session, eventLog */
var Session = function Session() {

    //global vars
    var session = {};
    var currentStage = 0;
    var content = $('#content');

    // Establish a new IOInterface for loading and saving
    session.id = 0;
    session.userData = {};
    var lastSaveTime;

    function saveFile(path) {
        var data = JSON.stringify(session.userData, undefined, 2);
        fs.writeFile(path, data);
    }

    function clickDownloadInput() {
        $('#save').prop('nwsaveas', session.returnSessionID()+'_'+Math.floor(Date.now() / 1000)+'.json');
        var event = document.createEvent('MouseEvents');
        event.initMouseEvent('click');
        document.getElementById('save').dispatchEvent(event);
    }

    var saveTimer;
    // custom events

    session.options = {
        fnBeforeStageChange : function(oldStage, newStage) {
            var eventProperties = {
                stage: currentStage,
                timestamp: new Date()
            };
            var log = new window.CustomEvent('log', {"detail":{'eventType': 'stageCompleted', 'eventObject':eventProperties}});
            window.dispatchEvent(log);

            var changeStageStartEvent = new window.CustomEvent('changeStageStart', {"detail":{oldStage: oldStage, newStage: newStage}});
            window.dispatchEvent(changeStageStartEvent);

        },
        fnAfterStageChange : function(oldStage, newStage) {
            var changeStageEndEvent = new window.CustomEvent('changeStageEnd', {"detail":{oldStage: oldStage, newStage: newStage}});
            window.dispatchEvent(changeStageEndEvent);
        }
    };

    session.init = function() {
        global.tools.notify('Session initialising.', 1);
        // exdend our local options with any passed options
        var path = require('path');
        var studyPath = path.normalize('../protocols/'+global.studyProtocol+'/'+global.studyProtocol+'.netcanvas');

        // todo: check this exists
        var study = require(studyPath);
        session.stages = study.stages;
        session.name = study.parameters.name;

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
                session.updateUserData(data);
                session.goToStage(0);
            }, session.id);
        });

        window.addEventListener('unsavedChanges', function () {
            session.saveManager();
        }, false);

        var sessionMenu = global.menu.addMenu('Session','hi-icon-cog');
        menu.addItem(sessionMenu, 'Reset Session', 'icon-globe', function() {
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

        menu.addItem(sessionMenu, 'Download Data', 'icon-briefcase', function() { clickDownloadInput(); });

        menu.addItem(sessionMenu, 'Purge Database', 'icon-cloud', function() {
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

        var stagesMenu = menu.addMenu('Stages', 'hi-icon-list');
        $.each(session.stages, function(index,value) {
            global.menu.addItem(stagesMenu, value.label, 'icon-play', function() {setTimeout(function() {session.goToStage(index);}, 500); });
        });

    };

    session.downloadData = function() {
        var filename = session.returnSessionID()+'.json';
        var text = JSON.stringify(session.userData, undefined, 2); // indentation level = 2;
        var pom = document.createElement('a');
        pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        pom.setAttribute('download', filename);
        pom.click();
    };

    session.reset = function() {
        global.tools.notify("Resetting session.",2);
        session.id = 0;
        session.currentStage = 0;
        var _window = global.gui.Window.get();
        _window.reloadDev();
    };

    session.saveManager = function() {
        clearTimeout(saveTimer);
        saveTimer = setTimeout(session.saveData, 3000);
    };

    session.updateUserData = function(data) {
        global.tools.notify("Updating user data.", 2);
        global.tools.notify("Using the following to update:", 1);
        global.tools.notify(data, 1);
        global.tools.notify("session.userData is:", 1);
        global.tools.notify(session.userData, 1);
        global.tools.extend(session.userData, data);
        // session.userData = $.extend(session.userData,data);
        global.tools.notify("Combined output is:", 0);
        global.tools.notify(session.userData, 0);

        var newDataLoaded = new window.Event('newDataLoaded');
        window.dispatchEvent(newDataLoaded);
        var unsavedChanges = new window.Event('unsavedChanges');
        window.dispatchEvent(unsavedChanges);
    };

    session.returnSessionID = function() {
        return session.id;
    };

    session.saveData = function() {
        global.dataStore.save(session.userData, session.returnSessionID());
        lastSaveTime = new Date();
    };

    session.goToStage = function(stage) {
        if (typeof stage === 'undefined' || typeof session.stages[stage] === 'undefined') { return false; }

        // Skip logic
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
        var eventProperties = {
            stage: stage,
            timestamp: new Date()
        };
        var log = new window.CustomEvent('log', {"detail":{'eventType': 'stageVisible', 'eventObject':eventProperties}});
        window.dispatchEvent(log);
        session.options.fnBeforeStageChange(currentStage,stage);
        var newStage = stage;

        var stagePath = "./protocols/"+global.studyProtocol+"/stages/"+session.stages[stage].page;
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

    session.registerData = function(dataKey, array) {
        global.tools.notify('A script requested a data store be registered with the key "'+dataKey+'".', 2);
        if (session.userData[dataKey] === undefined) { // Create it if it doesn't exist.
            global.tools.notify('Key named "'+dataKey+'" was not already registered. Creating.', 1);
            if (array) {
                session.userData[dataKey] = [];
            } else {
                session.userData[dataKey] = {};
            }
        } else {
            global.tools.notify ('A data store with this key already existed. Returning a pointer.',1);
        }
        var unsavedChanges = new window.Event('unsavedChanges');
        window.dispatchEvent(unsavedChanges);
        return session.userData[dataKey];
    };

    session.addData = function(dataKey, newData, append) {
        /*
        This function should let any module add data to the session model. The session model
        (global data variable) is essentially a key/value store.
        */

        if (!append) { append = false; }

        if (append === true) { // this is an array
            session.userData[dataKey].push(newData);
        } else {
            global.tools.extend(session.userData[dataKey], newData);
        }

        global.tools.notify("Adding data to key '"+dataKey+"'.",2);
        global.tools.notify(newData, 1);
        var unsavedChanges = new window.Event('unsavedChanges');
        window.dispatchEvent(unsavedChanges);

    };

    session.currentStage = function() {
        return currentStage;
    };

    session.returnData = function(dataKey) {
        if (!dataKey) {
            return session.userData;
        } else if (typeof session.userData[dataKey] !== 'undefined') {
            return session.userData[dataKey];
        } else {
            return session.userData;
        }
    };

    return session;
};

module.exports = new Session();

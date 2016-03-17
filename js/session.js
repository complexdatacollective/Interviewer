/* global document, window, $, protocol, nodeRequire, note, alert, FileReader */
/* exported Session, eventLog */
var Session = function Session() {
  'use strict';
  //window vars
  var session = {};
  var currentStage = 0;
  var content = $('#content');
  session.id = 0;
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
    $('#save').trigger('click');
    session.downloadData();
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

      // $(document).trigger('changeStageStart', {'detail':{oldStage: oldStage, newStage: newStage}});
      var changeStageStartEvent = new window.CustomEvent('changeStageStart', {'detail':{oldStage: oldStage, newStage: newStage}});
      window.dispatchEvent(changeStageStartEvent);

    },
    fnAfterStageChange : function(oldStage, newStage) {
      session.sessionData.sessionParameters.stage = newStage;
      var changeStageEndEvent = new window.CustomEvent('changeStageEnd', {'detail':{oldStage: oldStage, newStage: newStage}});
      window.dispatchEvent(changeStageEndEvent);
      if ((currentStage+1) === session.stages.length) { // last stage
        $('.paginate').removeAttr('disabled');
        $('.arrow-next').attr('disabled', 'disabled');
        if (currentStage === 0) { // first and last stage
          $('.arrow-prev').attr('disabled', 'disabled');
        }
      } else if (currentStage === 0) { // first stage
        $('.paginate').removeAttr('disabled');
        $('.arrow-prev').attr('disabled', 'disabled');
      } else {    // neither
        $('.paginate').removeAttr('disabled');
      }
    }
  };


  session.loadProtocol = function(protocolName, callback) {

    session.protocolName = protocolName;

    // Require the session protocol file.
    // var studyPath = path.normalize('../protocols/'+window.studyProtocol+'/protocol.js');
    $.getScript( 'protocols/'+protocolName+'/protocol.js', function() {

      // protocol.js files declare a protocol variable, which is what we use here.
      // It is implicitly loaded as part of the getScript callback
      var study = protocol;

      session.parameters = session.registerData('sessionParameters');
      session.updateSessionData({sessionParameters:study.sessionParameters});
      // copy the stages
      session.stages = study.stages;

      // insert the stylesheet
      $('head').append('<link rel="stylesheet" href="protocols/'+protocolName+'/css/style.css" type="text/css" />');

      // copy the skip functions
      if (typeof study.skipFunctions !== 'undefined') {
        session.skipFunctions = study.skipFunctions;
      }

      // set the study name (used for database name)
      if (study.sessionParameters.name) {
        session.name = study.sessionParameters.name;
      } else {
        note.error('Study protocol must have key "name" under sessionParameters.');
      }

      // create the sessionGlobals
      if (typeof study.globals !=='undefined') {
        session.globals = study.globals;
        // iterate through and execute;
        $.each(session.globals, function(index, value) {
          value();
        });
      }

      // Initialise the menu system – other modules depend on it being there.
      var stagesMenuOptions = {
        name: 'Stages',
        icon: 'fa-bars',
        items: []
      };

      $.each(session.stages, function(index,value) {
        var icon = null;
        if (value.icon) {
          icon = value.icon;
        }
        var itemObject = {
          label: value.label,
          icon: icon,
          action: function() {setTimeout(function() {session.goToStage(index);}, 500); }
        };

        stagesMenuOptions.items.push(itemObject);

      });

      window.stagesMenu = new window.netCanvas.Modules.Menu(stagesMenuOptions);
      callback();

    }).fail(function( jqxhr, textStatus, error ) {
      var err = textStatus + ', ' + error;
      note.error('Error fetching protocol!');
      note.trace(err);
    });

  };

  function sessionNextHandler() {
    session.nextStage();
  }

  function sessionPreviousHandler() {
    session.prevStage();
  }

  session.loadSessionData = function(id, callback) {
    note.debug('session.loadSessionData()');

    var process = function(data) {
      session.id = data._id;
      session.sessionData.sessionParameters = data.sessionParameters;

      // Build a new network
      session.sessionData.network = new window.netCanvas.Modules.Network();

      // Only load the network into the model if there is a network to load
      if(data.network && data.network.nodes && data.network.edges) {
        session.sessionData.network.loadNetwork({nodes:data.network.nodes, edges:data.network.edges}, true);
      } else {
        session.sessionData.network.init();
      }

      if (typeof session.sessionData.sessionParameters.stage !== 'undefined') {
        session.goToStage(session.sessionData.sessionParameters.stage);
      } else {
        session.goToStage(0);
      }

      if (callback) {
        callback();
      }
  };

    // if the session id is null, we load the last session or create a new session as needed
    if (id === null) {
      note.trace('session.loadSessionData: ID is null');
      window.dataStore.getLastSession(function(data) {
        process(data);
      });
    } else {
      note.trace('session.loadSessionData: ID is '+id);
      // if the session id is not null, we load that session id.
      window.dataStore.load(id, function(data) {
        process(data);
      });
    }


  };

  session.newSession = function() {
    note.debug('session.newSession(): creating new session...');
    // Pass null id so that new session is created
    window.dataStore.newSession(function(newDoc) {
      note.debug('session.newSession(): Session created with id '+newDoc._id);
      session.loadSessionData(newDoc._id, function() {
        if (typeof session.sessionData.sessionParameters.stage !== 'undefined') {
          session.goToStage(session.sessionData.sessionParameters.stage);
        } else {
          session.goToStage(0);
        }
      });
    });

  };

  session.init = function(properties) {
    note.info('Session initialising.');

    // Navigation arrows.
    $('.arrow-next').on('click', sessionNextHandler);

    $('.arrow-prev').on('click', sessionPreviousHandler);

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

    window.addEventListener('unsavedChanges', function () {
      session.saveManager();
    }, false);

    var sessionMenuOptions = {
      name: 'Session',
      icon: 'fa-cogs',
      items: []
    };

    window.sessionMenu = new window.netCanvas.Modules.Menu(sessionMenuOptions);
    window.sessionMenu.addItem('New Session', 'fa-plus', session.newSession);
    // window.sessionMenu.addItem('Reset this Session', 'fa-undo', function() {
    //     window.BootstrapDialog.show({
    //         type: window.BootstrapDialog.TYPE_DANGER,
    //         // size: BootstrapDialog.SIZE_LARGE,
    //         title: '',
    //         message: '<h3>Are you sure you want to reset the session?</h3> <p><strong>IMPORTANT:</strong> This will delete all data from this session. Data from other sessions will not be deleted (use purge database if you wish to delete this data too).',
    //         buttons: [{
    //             label: 'Continue',
    //             cssClass: 'btn-modal-success',
    //             action: function(){
    //                 window.dataStore.deleteDocument(session.reset);
    //             }
    //         }, {
    //             label: 'Cancel',
    //             cssClass: 'btn-modal-danger',
    //             action: function(dialogItself){
    //                 dialogItself.close();
    //             }
    //         }]
    //     });
    // });

    window.sessionMenu.addItem('Download Data', 'fa-download', clickDownloadInput);

    window.sessionMenu.addItem('Purge Database', 'fa-trash', function() {
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

    window.sessionMenu.addItem('Quit Network Canvas', 'fa-sign-out', function() { window.close(); });


    // Attempt to load the protocol passed as a session property

    session.loadProtocol(properties.protocol, function() {
        // If sucessful load the session data.
      window.dataStore.init(function() {
        session.loadSessionData(properties.sessionID);

        $('html').on('dragover', function(event) {
            event.preventDefault();
            event.stopPropagation();
            $(this).addClass('dragging');
        });

        $('html').on('dragleave', function(event) {
            event.preventDefault();
            event.stopPropagation();
            $(this).removeClass('dragging');
        });

        $('html').on('drop', function(event) {
            event.preventDefault();
            event.stopPropagation();
            console.log(event);

            var file = event.originalEvent.dataTransfer.files[0],
                reader = new FileReader();
            reader.onload = function (e) {
                try {
                    var json = JSON.parse(e.target.result);
                    // Check for obsolete file format
                    if (!json.network) {
                        json.network = {};
                    }
                    
                    if (json.nodes || json.edges) {
                        note.warn('Obsolete file format detected. Updating.');
                        if (json.nodes) {
                            json.network.nodes = json.nodes;
                            delete json.nodes;
                        }

                        if (json.edges) {
                            json.network.edges = json.edges;
                            delete json.edges;
                        }

                    }
                    window.dataStore.insertFile(json, session.loadSessionData);
                } catch (ex) {
                    note.error('ex when trying to parse json = ' + ex);
                }
            };
            reader.readAsText(file);

            return false;
        });

      });
    });

  };

  session.getPrimaryNetwork = function() {
    return session.sessionData.network;
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
    session.sessionData = {};

    if (window.isNodeWebkit) {
      window.gui.Window.get().reloadDev();
    } else {
      window.location.reload();
    }

  };

  session.saveManager = function() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(session.saveData, 1000);
  };

  session.updateSessionData = function(data, callback) {
    note.debug('session.updateSessionData()');
    note.trace(data);

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
    if(!window.dataStore.initialised()) {
      note.warn('session.saveData() tried to save before dataStore was initialised. Waiting.');
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

    // Skip logic

    // is there a skip function for this stage?
    if (session.stages[stage].skip) {

      //evaluate skip function
      var outcome = session.stages[stage].skip();

      // if true, skip the stage
      if (outcome === true) {
        if (stage > currentStage) {
          session.goToStage(stage+1);
        } else {
          session.goToStage(stage-1);

        }

        return false;
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
    var stagePath ='./protocols/'+session.protocolName+'/stages/'+session.stages[stage].page;
    stagePath += '?_=' + (new Date()).getTime();
    content.transition({opacity: '0'},400,'easeInSine').promise().done( function(){
      content.load( stagePath, function() {
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
    note.info('A script requested a data store be registered with the key "'+dataKey+'".');
    if (session.sessionData[dataKey] === undefined) { // Create it if it doesn't exist.
    note.debug('Key named "'+dataKey+'" was not already registered. Creating.');
    if (isArray) {
      session.sessionData[dataKey] = [];
    } else {
      session.sessionData[dataKey] = {};
    }
  } else {
    note.debug('A data store with this key already existed. Returning a reference.');
  }
  var unsavedChanges = new window.Event('unsavedChanges');
  window.dispatchEvent(unsavedChanges);
  return session.sessionData[dataKey];
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

/* global History, extend, IOInterface, notify, menu */
/* exported Session, eventLog */
var Session = function Session(options) {

  //global vars
  var session = {};
  var currentStage = 0;
  var $content = $('#content');
   
  // Establish a new IOInterface for loading and saving
  window.dataStore = {};
  session.id = 0;
  session.userData = {};
  var lastSaveTime;
  session.stages = [
          'intro.html',
          'namegen1.html',
          'namegen2.html',
          'namegen3.html',
          'namegen4.html',
          'listselect1.html',
          'namegen5.html',
          'namegenmod6.html',
          'listselect2.html',
          'namegen7.html',
          'namegenmod8.html'
                    ];
  
  var saveTimer;


  // custom events

  session.options = {
    fnBeforeStageChange : function(oldStage, newStage) {
      var changeStageStartEvent = new CustomEvent('changeStageStart', {"detail":{oldStage: oldStage, newStage: newStage}});
      window.dispatchEvent(changeStageStartEvent);

    },
    fnAfterStageChange : function(oldStage, newStage) {
      var changeStageEndEvent = new CustomEvent('changeStageEnd', {"detail":{oldStage: oldStage, newStage: newStage}});
      window.dispatchEvent(changeStageEndEvent);
    }    
  };

  session.init = function() {
    notify('Session initialising.', 1);
    // exdend our local options with any passed options
    extend(session.options,options); 

    //bind to the custom state change event to handle spinner interactions
    window.addEventListener('changeStageStart', function () { 
      $('.loader').transition({opacity:1});
    }, false);

    window.addEventListener('changeStageEnd', function () {
      $('.loader').transition({opacity:0});
    }, false);

    // Create our data interface
    window.dataStore = new IOInterface();
    // Check for an in-progress session
    if (localStorage.getObject('activeSession')!== false) {
      session.id = localStorage.getObject('activeSession');
      notify("Existing session found (session id: "+session.id+"). Loading.", 3);
      // load data.
      window.dataStore.init(session.id);
      window.dataStore.load(session.updateUserData);
    } else {
      notify("No existing session found. Creating new session.", 3);
      session.id = window.dataStore.init(); // returns ID of an unused slot on the server. 
    }
    
    session.registerData("session");
    // Historyjs integration for page loading
    History.Adapter.bind(window, 'statechange', function(){
    });

    var State = History.getState();    

    if(State.data.stage) {
      session.goToStage(State.data.stage);
    } else {
      session.goToStage(0);
    }

    window.addEventListener('unsavedChanges', function () { 
      session.saveManager();
    }, false);

    var sessionMenu = menu.addMenu('Session','hi-icon-cog');
    menu.addItem(sessionMenu, 'Load Data by ID', 'icon-user', function() { return true; });
    menu.addItem(sessionMenu, 'Reset Session', 'icon-globe', session.reset);
    menu.addItem(sessionMenu, 'Download Data', 'icon-briefcase', function() { return true; });
    menu.addItem(sessionMenu, 'Sync with Server', 'icon-cloud', session.saveData);

  };

  session.reset = function() {
    notify("Resetting session.",2);
    localStorage.removeItem('activeSession');
    localStorage.removeItem('nodes');
    localStorage.removeItem('edges');
    localStorage.removeItem('session');
    localStorage.removeItem('log');
    session.id = 0;
    session.currentStage = 0;
    window.dataStore.save(session.userData);
    History.pushState({'stage': 0},null, '?stage='+0);
    location.reload();
  };

  session.saveManager = function() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(session.saveData, 3000);
  };

  session.updateUserData = function(data) {
    notify("Updating user data.", 2);
    notify("Using the following to update:", 1);
    notify(data, 1);
    notify("session.userData is:", 1);
    notify(session.userData, 1);
    extend(session.userData, data);
    // session.userData = $.extend(session.userData,data);
    notify("Combined output is:", 0);
    notify(session.userData, 0);

    var newDataLoaded = new Event('newDataLoaded');
    window.dispatchEvent(newDataLoaded);        
    var unsavedChanges = new Event('unsavedChanges');
    window.dispatchEvent(unsavedChanges);
  };

  session.returnSessionID = function() {
    return session.id;
  };

  session.saveData = function() {
    window.dataStore.save(session.userData);
    lastSaveTime = new Date();
  };

  session.goToStage = function(stage) {
    if (typeof stage === 'undefined' || typeof session.stages[stage] === 'undefined') { return false; }

    notify('Session is moving to stage '+stage, 3);
    session.options.fnBeforeStageChange(currentStage,stage);
    var newStage = stage;
    $content.transition({opacity: '0'},400,'easeInSine').promise().done( function(){
      $content.load( "stages/"+session.stages[stage], function() {
        // This never gets called if there is a JS error. Is there a way to ensure it is?
        $content.transition({ opacity: '1'},400,'easeInSine');    
      });
    });                    
    var oldStage = currentStage;
    currentStage = newStage;
    History.pushState({'stage': stage},null, '?stage='+stage);
    session.options.fnAfterStageChange(oldStage, currentStage);
    var unsavedChanges = new Event('unsavedChanges');
    window.dispatchEvent(unsavedChanges);
  };

  session.nextStage = function() {
    session.goToStage(currentStage+1);
  };

  session.prevStage = function() {
    session.goToStage(currentStage-1);
  };

  session.addStage = function() {
  };

  session.registerData = function(dataKey, array) {
    notify('A script requested a data store be registered with the key "'+dataKey+'".', 2);
    if (session.userData[dataKey] === undefined) { // Create it if it doesn't exist.
      notify('Key named "'+dataKey+'" was not already registered. Creating.', 1);
      if (array) {
        session.userData[dataKey] = [];
      } else {
        session.userData[dataKey] = {};
      }
    } else {
      notify ('A data store with this key already existed. Returning a pointer.',1);
    }
    var unsavedChanges = new Event('unsavedChanges');
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
      extend(session.userData[dataKey], newData);
    }
    
    notify("Adding data to key '"+dataKey+"'.",2);
    notify(newData, 1);
    var unsavedChanges = new Event('unsavedChanges');
    window.dispatchEvent(unsavedChanges);

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

  session.init();

  return session;
};
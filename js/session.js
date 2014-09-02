/* global History, extend, IOInterface, notify */
/* exported Session, eventLog */
var Session = function Session(options) {

  //global vars
  var session = {};
  var currentStage = 0;
  var $content = $('#content');
   
  // Establish a new IOInterface for loading and saving
  var dataStore;
  session.id = 0;
  session.userData = {};
  var lastSaveTime;
  session.stages = ['intro.html','namegenerator.html'];
  
  var saveTimer;


  // custom events

  session.options = {
    fnBeforeStageChange : function() {
      var changeStageStartEvent = new Event('changeStageStart');
      window.dispatchEvent(changeStageStartEvent);

    },
    fnAfterStageChange : function() {
      var changeStageEndEvent = new Event('changeStageEnd');
      window.dispatchEvent(changeStageEndEvent);
    }    
  };

  session.init = function() {

    // exdend our local options with any passed options
    extend(session.options,options); 

    //bind to the custom state change event to handle spinner interactions
    window.addEventListener('changeStageStart', function () { 
      $('.loader').transition({opacity:1});
    }, false);

    window.addEventListener('changeStageEnd', function () {
      $('.loader').transition({opacity:0});
    }, false);

    window.nodes = session.registerData('nodes', true);
    window.edges = session.registerData('edges', true);

    // Create our data interface
    dataStore = new IOInterface();
    // Check for an in-progress session
    if (localStorage.getObject('activeSession')!== false) {
      session.id = localStorage.getObject('activeSession');
      notify("Existing session found (session id: "+session.id+"). Loading.", 3);
      // load data.
      dataStore.init(session.id);
      dataStore.load(session.updateUserData);
    } else {
      notify("No existing session found. Creating new session.", 3);
      session.id = dataStore.init(); // returns ID of an unused slot on the server. 
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

  };

  session.saveManager = function() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(session.saveData, 2000);
  };

  session.updateUserData = function(data) {
    notify("Updating user data.", 2);
    notify("Using the following to update:", 1);
    notify(data, 1);
    notify("session.userData is:", 1);
    notify(session.userData, 1);
    extend(session.userData, data);
    notify("Combined output is:", 0);
    notify(session.userData, 0);    
    var unsavedChanges = new Event('unsavedChanges');
    window.dispatchEvent(unsavedChanges);
  };

  session.returnSessionID = function() {
    return session.id;
  };

  session.saveData = function() {
    dataStore.save(session.userData);
    lastSaveTime = new Date();
  };

  session.addNode = function(options) {
    var nodeOptions = {
      id: window.nodes.length+1,
      label: 'Josh'
    };

    extend(nodeOptions, options);

    window.nodes.push(nodeOptions);
    var log = new CustomEvent('log', {"detail":{'eventType': 'nodeCreate', 'eventObject':nodeOptions}});
    window.dispatchEvent(log);
    var nodeAddedEvent = new CustomEvent('nodeAdded',{"detail":nodeOptions});
    window.dispatchEvent(nodeAddedEvent);
    var unsavedChanges = new Event('unsavedChanges');
    window.dispatchEvent(unsavedChanges);
  };

  session.addEdge = function(from, to) {
    var alreadyExists = false;

    var edgeOptions = {
      'from': from,
      'to'  : to
    };

    if (alreadyExists) {
        return false;
    }

    window.edges.push(edgeOptions);
    var edgeAddedEvent = new Event('edgeAdded',{'options':edgeOptions});
    window.dispatchEvent(edgeAddedEvent);
    var unsavedChanges = new Event('unsavedChanges');
    window.dispatchEvent(unsavedChanges);

  };  

  session.goToStage = function(stage) {
    session.options.fnBeforeStageChange();
    var newStage = stage;
    $content.transition({ opacity: '0'},400,'easeInSine').promise().done( function(){
      $content.load( "stages/"+session.stages[stage], function() {
        $content.transition({ opacity: '1'},400,'easeInSine');    
      });
    });                    
    currentStage = newStage;
    History.pushState({'stage': stage},null, '?stage='+stage);
    session.options.fnAfterStageChange();
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
    if (session.userData[dataKey] === undefined) { // Create it if it doesn't exist.
      if (array) {
        session.userData[dataKey] = [];
      } else {
        session.userData[dataKey] = {};
      }
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
      console.log(typeof session.userData[dataKey].length);
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
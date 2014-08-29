/* global History, extend, IOInterface, Logger, notify */
/* exported Session, eventLog */
var Session = function Session(options) {

  //global vars
  var session = {};
  var currentStage = 0;
  var $content = $('#content');
  var eventLog = new Logger();
  
  // Establish a new IOInterface for loading and saving
  var dataStore;
  session.id = 0;
  session.userData = {};
  session.stages = ['intro.html','namegenerator.html'];


  // custom events
  var changeStageStartEvent = new Event('changeStageStart');
  var changeStageEndEvent = new Event('changeStageEnd');

  session.options = {
    fnBeforeStageChange : function() {
      window.dispatchEvent(changeStageStartEvent);

    },
    fnAfterStageChange : function() {
      window.dispatchEvent(changeStageEndEvent);
    }    
  };

  session.log = function(type,e,id) {
    eventLog.addToLog(type,e,id);
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


    // Create our data interface
    dataStore = new IOInterface();
    // Check for an in-progress session
    if (localStorage.getObject('activeSession')!== false) {
      session.id = localStorage.getObject('activeSession');
      notify("Existing session found (session id: "+session.id+"). Loading.", 3);
      // load data.
      dataStore.init(session.id);
      session.loadData();
    } else {
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

  };

  session.updateUserData = function(data) {
    extend(session.userData, data);
  };

  session.returnSessionID = function() {
    return session.id;
  };

  session.loadData = function() {
    dataStore.load();
  };

  session.saveData = function() {
    notify('saving data.', 3);
    dataStore.save(session.userData);
  };

  session.addNode = function() {

    var nodeOptions = {
      id: window.nodes.length+1,
      label: 'Josh'
    };

    window.nodes.push(nodeOptions);

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
    return session.userData[dataKey];
  };

  session.addData = function(dataKey, newData) {
    /*
      This function should let any module add data to the session model. The session model 
      (global data variable) is essentially a key/value store. 
    */
    extend(session.userData[dataKey], newData);
    notify("Adding data to "+dataKey+".",2);
    console.log("session data is now:");
    console.log(session.userData);

  };

  session.returnData = function(dataKey) {
    return session.userData[dataKey];
  };

  session.returnSessionData = function() {
    return session.userData;
  };

  session.init();

  return session;
};
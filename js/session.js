/* global History, extend, IOInterface, Logger */
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
  session.date = new Date();
  session.data = {};
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

    dataStore = new IOInterface();

    // Historyjs integration for page loading
    History.Adapter.bind(window, 'statechange', function(){
      var State = History.getState();
      console.log(State);
    });

    var State = History.getState();    

    if(State.data.stage) {
      session.goToStage(State.data.stage);
    } else {
      session.goToStage(0);
    }

  };

  session.loadData = function(id) {
    session.data = dataStore.load(id);
  };

  session.saveData = function() {
    dataStore.save(session.data);
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

  session.addStage = function(stage) {
    console.log(stage);
  };

  session.registerData = function(dataKey) {
    session.data[dataKey] = {};
  };

  session.addData = function(dataKey, newData) {
    /*
      This function should let any module add data to the session model. The session model 
      (global data variable) is essentially a key/value store. 
    */
    console.log(newData);
    session.data[dataKey] = newData;


  };

  session.getData = function() {
    return session.data;
  };

  session.init();

  return session;
};
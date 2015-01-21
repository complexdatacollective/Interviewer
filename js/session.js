/* global History, extend, IOInterface, notify, menu, network */
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

  function drugSkip(drugVar) {
      if (typeof network !== 'undefined') {
          var properties = {};
          properties[drugVar] = 1;
          // are there actually any drug edges?
          var drugEdges = network.getEdges({from:network.getNodes({type_t0:'Ego'})[0].id, type:'Drugs'});
          var required = network.getNodes(properties);

          if (drugEdges.length === 0 || required.length === 0) {
              return false;
          } else {
              return true;
          }
      }
  }


  session.stages = [
          {label:'Intro', page:'intro.html'},
          {label:'NG: closest', page:'namegen1.html'},
          {label:'NG: marijuana or other drugs', page:'namegen5.html'},
          {label:'NG: drugs, two or more', page:'namegenmod6.html'},
          {label:'NG: other people sex', page:'namegen7.html'},
          {label:'NG: sex, two or more', page:'namegenmod8.html'},
          {label:'NET: layout', page:'canvaslayout.html'},
          {label:'NET EDGE: social', page:'canvasedge1.html'},
          {label:'NET NI: who recruited', page:'canvasselect2.html', skip: function() { if (typeof network !== 'undefined') { var required = network.getNodes({seed_status_t0:'Non-Seed'}); if (required.length === 0) { return false; } else { return true; }}}},
          {label:'NET NI: who drunk with', page:'canvasselect3.html'},
          {label:'NET NI: who drugs with', page:'canvasselect4.html'},
          {label:'NET NI: who sex with', page:'canvasselect5.html'},
          {label:'ORD: contact frequency', page:'ordbin1a.html'},
          {label:'ORD: relationship strength', page:'ordbin1.html'},
          {label:'NET NI: get advice', page:'canvasselect6.html'},
	      {label:'NET NI: Serious relationship?', page:'canvasselect8.html'},
          {label:'CAT: gender identity', page:'multibin5.html'},
          {label:'RACE: Hispanic or Latino', page:'canvasselect14.html'},
          {label:'RACE: Racial Identity', page:'multibin2.html'},
          {label:'CAT: sexuality', page:'multibin3.html'},
          {label:'CAT: location', page:'multibin4.html'},
          {label:'MAP: location in Chicago', page:'map1.html'},
          {label:'LIST SELECT: which drugs?', page:'listselect1.html'},
          {label:'ORD: Marijuana freq', page:'ordbin6.html',skip: function() { return drugSkip('d1_t0'); }},
          {label:'ORD: Cocaine or Crack freq', page:'ordbin7.html', skip: function() { return drugSkip('d2_t0'); }},
          {label:'ORD: Heroin freq', page:'ordbin8.html', skip: function() { return drugSkip('d3_t0'); }},
          {label:'ORD: Methamphetamines freq', page:'ordbin9.html', skip: function() { return drugSkip('d4_t0'); }},
          {label:'ORD: Painkillers or Opiates freq', page:'ordbin10.html', skip: function() { return drugSkip('d5_t0'); }},
          {label:'ORD: Poppers freq', page:'ordbin11.html', skip: function() { return drugSkip('d6_t0'); }},
          {label:'ORD: Stimulants or Amphetamines freq', page:'ordbin12.html', skip: function() { return drugSkip('d7_t0'); }},
          {label:'ORD: Depressants or Tranquilizers freq', page:'ordbin13.html', skip: function() { return drugSkip('d8_t0'); }},
          {label:'ORD: Ecstasy freq', page:'ordbin14.html', skip: function() { return drugSkip('d9_t0'); }},
          {label:'ORD: Other Drugs freq', page:'ordbin15.html', skip: function() { return drugSkip('d10_t0'); }},
          {label:'NET EDGE: drugs', page:'canvasedge2.html'},
          {label:'CAT: where met sex partners', page:'multibin6.html'},
          {label:'DATE: first and last sex', page:'dateinterface1.html'},
          {label:'CAT: HIV status of sex partners', page:'multibin7.html'},
          {label:'CAT: Vaginal sex?', page:'multibin9.html',
          skip: function() {
              // need to skip male participant with only male sex partners
            //   Dyad edge
            //   gender_p_t0 'Male'
                if (typeof network !== 'undefined') {
                        var totalEdges = network.getEdges({type:'Dyad'});
                        var maleEdges = network.getEdges({type:'Dyad', gender_p_t0: 'Male'}).length;
                        if (network.getNodes({type_t0:'Ego'})[0].gender_k === 'Male' && totalEdges.length === maleEdges.length) {
                            return false;
                        } else {
                            return true;
                        }
                    }
                }

          },
          {label:'CAT: Anal sex?', page:'multibin10.html',
          skip: function() {
              // need to skip female participant with only female sex partners

                  if (typeof network !== 'undefined') {
                      var totalEdges = network.getEdges({type:'Dyad'});
                      var femaleEdges = network.getEdges({type:'Dyad', gender_p_t0: 'Female'}).length;
                      if (network.getNodes({type_t0:'Ego'})[0].gender_k === 'Female' && totalEdges.length === femaleEdges.length) {
                          return false;
                      } else {
                          return true;
                      }
                  }
              }
          },
          {label:'NET EDGE: sex', page:'canvasedge3.html'},
          {label:'SWITCH: multiple sex partners', page:'multiplepartners.html'},
          {label:'NET NI: who multiple sex partners', page:'canvasselect7.html', skip: function() { if (typeof network !== 'undefined') { var required = network.getNodes({multiple_sex_t0: 'yes'}); if (required.length === 0) { return false; } else { return true; }}}},
          {label:'Thank You', page:'thanks.html'},
          {label:'Download Data', page:'download.html'},
          {label:'Finish', page:'finish.html'}
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
    menu.addItem(sessionMenu, 'Download Data', 'icon-briefcase', function() { session.downloadData(); });
    // menu.addItem(sessionMenu, 'Sync with Server', 'icon-cloud', session.saveData);

    var stagesMenu = menu.addMenu('Stages', 'hi-icon-list');
    $.each(session.stages, function(index,value) {
      menu.addItem(stagesMenu, value.label, 'icon-play', function() {setTimeout(function() {session.goToStage(index);}, 500); });
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

    // Skip logic
    if (session.stages[stage].skip) {

      //evaluate skip function
      var outcome = session.stages[stage].skip();

      // if false, skip the stage
      if (outcome === false) {
        if (stage > currentStage) {
          session.goToStage(stage+1);
        } else {
          session.goToStage(stage-1);

        }

        return false;
      }
    }
    notify('Session is moving to stage '+stage, 3);
    session.options.fnBeforeStageChange(currentStage,stage);
    var newStage = stage;
    $content.transition({opacity: '0'},400,'easeInSine').promise().done( function(){
      $content.load( "stages/"+session.stages[stage].page, function() {
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

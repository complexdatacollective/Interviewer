/* global History */
/* exported Session */
var Session = function Session(options) {

  var session = {};
  var currentStage = 0;
  var $content = $('#content');
  var changeStageEvent = new Event('changeStage');
  session.id = 0;
  session.date = new Date();
  session.stages = ['intro.html','namegenerator.html'];

    History.Adapter.bind(window, 'statechange', function(){
      var State = History.getState();
      console.log(State);
    });

  // private
  function extend( a, b ) {
      for( var key in b ) { 
          if( b.hasOwnProperty( key ) ) {
              a[key] = b[key];
          }
      }
      return a;
  }

  session.options = {
    fnBeforeStageChange : function() {
      return false;
    },
    fnAfterStageChange : function() {
      return false;
    }    
  };     

  session.init = function() {
    extend(session.options,options);

    var State = History.getState();    

    if(State.data.stage) {
      session.goToStage(State.data.stage);
    } else {
      session.goToStage(0);
    }


    $('.arrow-next').click(function() {
        session.nextStage();
    });
    $('.arrow-prev').click(function() {
        session.prevStage();
    });
  };

  session.loadData = function(path) {
    var data = JSON.parse(path);
    $.extend(session, data);
  };

  session.goToStage = function(stage) {
    session.options.fnBeforeStageChange();
    window.dispatchEvent(changeStageEvent);
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


  return session;
};
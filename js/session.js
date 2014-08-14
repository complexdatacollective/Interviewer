/* exported Session */
var Session = function Session(options) {

  var session = {};
  var currentStage = 0;
  var $content = $('#content');

  session.id = 0;
  session.date = new Date();
  session.stages = 2;


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
    session.goToStage(0);
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
    var newStage = stage;
    $content.transition({ opacity: '0'},700,'easeInSine').promise().done( function(){
      $content.load( "stages/"+stage+".html", function() {
        $content.transition({ opacity: '1'},700,'easeInSine');    
      });
    });                    
    currentStage = newStage;
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
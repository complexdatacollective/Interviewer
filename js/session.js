/* exported Session */
var Session = function Session() {

  var session = {};
  var currentStage = 0;
  var $content = $('#content');

  session.id = 0;
  session.date = new Date();
  session.stages = 2;

  session.init = function() {
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
    var newStage = stage;
    $content.transition({ opacity: '0'},700,'easeInSine').promise().done( function(){
      $content.load( "stages/"+stage+".html", function() {
        $content.transition({ opacity: '1'},700,'easeInSine');    
      });
    });                    
    currentStage = newStage;
  };

  session.nextStage = function() {
    session.goToStage(currentStage+1);
  };

  session.prevStage = function() {
    session.goToStage(currentStage-1);
  };


  return session;
};
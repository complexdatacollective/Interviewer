/* exported Interview */
/* global $ */
var Interview = function Interview() {
    'use strict';
    var interview = {};
    var currentStage = 0;
    var $content = $('#content');

    interview.id = 0;
    interview.date = new Date();
    interview.stages = 2;

    interview.init = function() {
        interview.goToStage(0);
        $('.arrow-next').click(function() {
            interview.nextStage();
        });
        $('.arrow-prev').click(function() {
            interview.prevStage();
        });
    };

    interview.loadData = function(path) {
        var data = JSON.parse(path);
        $.extend(interview, data);
    };

    interview.goToStage = function(stage) {
        var newStage = stage;
        $content.transition({ opacity: '0'},700,'easeInSine').promise().done( function(){
            $content.load( 'stages/'+stage+'.html', function() {
                $content.transition({ opacity: '1'},700,'easeInSine');
            });
        });
        currentStage = newStage;
    };

    interview.nextStage = function() {
        interview.goToStage(currentStage+1);
    };

    interview.prevStage = function() {
        interview.goToStage(currentStage-1);
    };


    return interview;
};

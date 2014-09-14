/* global network, extend, notify */
/* exported MultiBin */
var MultiBin = function MultiBin(options) {

  //global vars
  var multiBin = {};
  multiBin.options = {
    targetEl: $('.container'),
    edgeType: 'Dyad',
    variable: {
      label:'gender_p_t0',
      values: [
        'Female',
        'Male',
        'Transgender',
        'Don\'t Know',
        'Won\'t Answer'
      ]
    },
    heading: "Default Heading",
    subheading: "Default Subheading."
  };

  extend(multiBin.options, options);

  var stageChangeHandler = function() {
    multiBin.destroy();
  };

  multiBin.destroy = function() {
    // Event Listeners
    notify("Destroying multiBin.",0);
    window.removeEventListener('changeStageStart', stageChangeHandler, false);

  };

  multiBin.init = function() {
    // Event Listeners
    window.addEventListener('changeStageStart', stageChangeHandler, false);

    // Add header and subheader
    multiBin.options.targetEl.append('<h1>'+multiBin.options.heading+'</h1>');
    multiBin.options.targetEl.append('<p class="lead">'+multiBin.options.subheading+'</p>');

    // get all edges
    var edges = network.getEdges({from:network.getNodes({type_t0:'Ego'})[0].id, type:multiBin.options.edgeType});

    // Add node bucket
    multiBin.options.targetEl.append('<div class="node-bucket"></div>');

    // Add edges to bucket
    $.each(edges, function(index,value) {
      $('.node-bucket').append('<div class="node-item draggable">'+value.nname_t0+'</div>');
    });



 // Experiment

    $(".draggable").draggable({ cursor: "pointer", revert: "invalid"});

    // One of these for each bin. One bin for each variable value.

    $.each(multiBin.options.variable.values, function(index, value){
      var newBin = $('<div class="node-bin n'+index+'"><h1>'+value+'</h1><h4>(Empty)</h4></div>');
      multiBin.options.targetEl.append(newBin);

      $(".n"+index).droppable({ accept: ".draggable", 
        drop: function(event, ui) {
          $(this).removeClass("over");
          var dropped = ui.draggable;
          var droppedOn = $(this);
          $(dropped).detach().appendTo(droppedOn);
          var noun = "people";
          if ($(".n"+index).children().length-2 === 1) {
            noun = "person";
          }
          $(".n"+index+" h4").html($(".n"+index).children().length-2+' '+noun+'.');

          var el = $(".n"+index);
            // var origBg = el.css('background-color');
            el.transition({scale:1.2}, 400, 'ease');
            setTimeout(function(){
              el.transition({background:el.data('oldBg')}, 200, 'ease');
              el.transition({ scale:1}, 500, 'ease');
            }, 400);        
        }, 
        over: function() {
            $(this).data('oldBg', $(this).css('background-color'));
            $(this).stop().transition({background:'rgba(255, 193, 0, 1.0)'}, 400, 'ease');
          
        },
        out: function() {
          $(this).stop().transition({background:$(this).data('oldBg')}, 500, 'ease');
        }
      });

    });

// experiment ends



  };

  multiBin.init();

  return multiBin;
};
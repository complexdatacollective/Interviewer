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

  var backgroundClickHandler = function(e) {
    if (e.target !== e.currentTarget) {
      // return false;
      } else {
      $('.container').fadeIn();
      $('.copy').removeClass('node-bin-active'); 
      setTimeout(function(){
        $('.copy').remove();
      },500);
      

      $('.content').off("click", backgroundClickHandler);      
    }

  };

  var nodeBinClickHandler = function() {
    if(!$(this).hasClass('.node-bin-active')) {
      $('.content').on("click", backgroundClickHandler);
      $('.container').fadeOut();
      var position = $(this).offset();
      var nodeBinDetails = $(this).clone(true);
      nodeBinDetails.offset(position);
      nodeBinDetails.addClass('copy');
      nodeBinDetails.removeClass('node-bin-static');
      nodeBinDetails.children('h1, h4').remove();

      $('.content').append(nodeBinDetails);
      $('.active-node-list').children('.node-item').css({top:0,left:20,opacity:0});

      setTimeout(function(){
        nodeBinDetails.addClass('node-bin-active');
        $.each($('.active-node-list').children(), function(index,value) {
          setTimeout(function(){
            $(value).transition({left:0,opacity:1});
          },50*index);
        });
      },0);
    }

  };

  var nodeClickHandler = function() {
    if($(this).parent().hasClass('active-node-list')) {
      var el = $(this);
      var id = $(this).parent().parent().data('index');
      console.log('id is:');
      console.log(id);
      var edgeID = network.getEdges({from:network.getNodes({type_t0:'Ego'})[0].id,to:el.data('node-id'), type:'Dyad'})[0].id;
      var properties = {};
      properties[multiBin.options.variable.label] = '';
      network.updateEdge(edgeID,properties);
      var noun = "people";
      console.log($('*[data-index="'+id+'"]').first().children('.active-node-list').children().length);
      if ($('*[data-index="'+id+'"]').first().children('.active-node-list').children().length-1 === 1) {
        noun = "person";
      }
      
      if ($('*[data-index="'+id+'"]').first().children('.active-node-list').children().length-1 === 0) {
      $('div[data-index="'+id+'"]').first().children('h4').html('(Empty)');
    } else {
      $('div[data-index="'+id+'"]').first().children('h4').html($('div[data-index="'+id+'"]').first().children('.active-node-list').children().length-1+' '+noun+'.');
    }

      $('div[data-index="'+id+'"]').first().children('.active-node-list').children().remove();
      var parent = el.parent();  
      el.detach().appendTo('.node-bucket');
      var list = parent.children().clone(true);
      $('div[data-index="'+id+'"]').first().children('.active-node-list').append(list);

    }
  };

  multiBin.destroy = function() {
    // Event Listeners
    notify("Destroying multiBin.",0);
    window.removeEventListener('changeStageStart', stageChangeHandler, false);

  };

  multiBin.init = function() {
    // Event Listeners
    window.addEventListener('changeStageStart', stageChangeHandler, false);
    $(document).on("click", '.node-bin-static', nodeBinClickHandler);
    $(document).on("click", '.node-item', nodeClickHandler);

    // Add header and subheader
    multiBin.options.targetEl.append('<h1>'+multiBin.options.heading+'</h1>');
    multiBin.options.targetEl.append('<p class="lead">'+multiBin.options.subheading+'</p>');

    // get all edges
    var edges = network.getEdges({from:network.getNodes({type_t0:'Ego'})[0].id, type:multiBin.options.edgeType});

    // Add node bucket
    multiBin.options.targetEl.append('<div class="node-bucket"></div>');

    // Add edges to bucket
    $.each(edges, function(index,value) {
      $('.node-bucket').append('<div class="node-item draggable" data-node-id="'+value.to+'">'+value.nname_t0+'</div>');
    });



 // Experiment

    $(".draggable").draggable({ cursor: "pointer", revert: "invalid"});

    // One of these for each bin. One bin for each variable value.

    $.each(multiBin.options.variable.values, function(index, value){
      var newBin = $('<div class="node-bin node-bin-static n'+index+'" data-index="'+index+'"><h1>'+value+'</h1><h4>(Empty)</h4><div class="active-node-list"></div></div>');
      newBin.data('index', index);
      multiBin.options.targetEl.append(newBin);

      $(".n"+index).droppable({ accept: ".draggable", 
        drop: function(event, ui) {
          var dropped = ui.draggable;
          var droppedOn = $(this);
          $(dropped).detach().appendTo(droppedOn.children('.active-node-list'));
          var properties = {};
          properties[multiBin.options.variable.label] = multiBin.options.variable.values[index];
          // Add the attribute
          var edgeID = network.getEdges({from:network.getNodes({type_t0:'Ego'})[0].id,to:$(dropped).data('node-id'), type:'Dyad'})[0].id;
          network.updateEdge(edgeID,properties);
          
          var noun = "people";
          if ($(".n"+index+" .active-node-list").children().length === 1) {
            noun = "person";
          }
          $(".n"+index+" h4").html($(".n"+index+" .active-node-list").children().length+' '+noun+'.');

          var el = $(".n"+index);
            // var origBg = el.css('background-color');
            el.transition({scale:1.2}, 200, 'ease');
            setTimeout(function(){
              el.transition({background:el.data('oldBg')}, 200, 'ease');
              el.transition({ scale:1}, 200, 'ease');
            }, 0);        
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
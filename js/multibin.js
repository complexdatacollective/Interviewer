/* global network, extend, notify */
/* exported MultiBin */
var MultiBin = function MultiBin(options) {

  //global vars
  var multiBin = {}, followup;
  multiBin.options = {
    targetEl: $('.container'),
    edgeType: 'Dyad',
    variable: {
      label:'multibin_variable',
      values: [
        'Variable 1',
      ]
    },
    heading: "Default Heading",
    subheading: "Default Subheading."
  };

  var open = false;
  extend(multiBin.options, options);

  var stageChangeHandler = function() {
    multiBin.destroy();
  };

  var followupHandler = function() {
    var followupVal = $(this).data('value');
    var nodeid = followup;
    var criteria = {
      to:nodeid
    };

    extend(criteria, multiBin.options.criteria);
    var edge = network.getEdges(criteria)[0];

    var followupProperties = {};

    followupProperties[multiBin.options.followup.variable] = followupVal;

    extend(edge, followupProperties);
    network.updateEdge(edge.id, edge);
    $('.followup').hide();
  };

  var backgroundClickHandler = function(e) {
    e.stopPropagation();
    if (e.target !== e.currentTarget) {

      if (open === true) {
        $('.container').children().removeClass('invisible');
        $('.copy').removeClass('node-bin-active');
        $('.copy').addClass('node-bin-static');
        $('.copy').children('h1, p').show();
        $('.copy').removeClass('copy'); 
        $(".draggable").draggable({ cursor: "pointer", revert: "invalid", disabled: false });
        open = false;  
      } else {
      }

    }

  };

  var nodeBinClickHandler = function(e) {
    e.stopPropagation();
    if (open === false) {

      $(".draggable").draggable({ cursor: "pointer", revert: "invalid", disabled: true });
      if(!$(this).hasClass('.node-bin-active')) {
        $('.container').children().not(this).addClass('invisible');
        var position = $(this).offset();
        var nodeBinDetails = $(this);
        nodeBinDetails.offset(position);
        nodeBinDetails.addClass('node-bin-active copy');
        nodeBinDetails.removeClass('node-bin-static');
        nodeBinDetails.children('h1, p').hide();

        // $('.content').append(nodeBinDetails);
        nodeBinDetails.children('.active-node-list').children('.node-item').css({top:0,left:20,opacity:0});

        setTimeout(function(){
          nodeBinDetails.addClass('node-bin-active');
          $.each($('.active-node-list').children(), function(index,value) {
            setTimeout(function(){
              $(value).transition({left:0,opacity:1});
            },50*index);
          });
        },400);
      }

      open = true;
    }

    

  };

  var nodeClickHandler = function(e) {
    e.stopPropagation();
      var el = $(this);
      var id = $(this).parent().parent().data('index');

      // has the node been clicked while in the bucket or while in a bin?
      if ($(this).parent().hasClass('active-node-list')) {
        // it has been clicked while in a bin.
        var edgeID = network.getEdges({from:network.getNodes({type_t0:'Ego'})[0].id,to:el.data('node-id'), type:'Dyad'})[0].id;
        var properties = {};
        properties[multiBin.options.variable.label] = '';
        network.updateEdge(edgeID,properties);
        $(this).fadeOut(400, function() {
          $(this).appendTo('.node-bucket');
          $(this).css('display', '');
          var noun = "people";
          if ($('.c'+id).children('.active-node-list').children().length === 1) {
            noun = "person";
          }
          if ($('.c'+id).children('.active-node-list').children().length === 0) {
            $('.c'+id).children('p').html('(Empty)');
          } else {
          $('.c'+id).children('p').html($('.c'+id).children('.active-node-list').children().length+' '+noun+'.');
          }

        });
        


      }

  };

  multiBin.destroy = function() {
    // Event Listeners
    notify("Destroying multiBin.",0);
    window.removeEventListener('changeStageStart', stageChangeHandler, false);
    $('.node-bin-static').off("click", nodeBinClickHandler);
    $('.node-item').off("click", nodeClickHandler);
    $('.content').off("click", backgroundClickHandler);
    $(document).off('click', '.followup-option', followupHandler);

  };

  multiBin.init = function() {
    // Add header and subheader
    multiBin.options.targetEl.append('<h1>'+multiBin.options.heading+'</h1>');
    multiBin.options.targetEl.append('<p class="lead">'+multiBin.options.subheading+'</p>');

    // Add node bucket
    multiBin.options.targetEl.append('<div class="node-bucket"></div>');

    if(typeof multiBin.options.followup !== 'undefined') { 
        multiBin.options.targetEl.append('<div class="followup"><h2>'+multiBin.options.followup.prompt+'</h2></div>');
        $.each(multiBin.options.followup.values, function(index,value) {
          $('.followup').append('<span class="btn btn-primary btn-block followup-option" data-value="'+value.value+'">'+value.label+'</span>');
        });    
    }  

    var number = Math.floor(multiBin.options.variable.values.length*0.66);
    var itemSizeW = $('.container').outerWidth()/number;


    var itemSize = itemSizeW;
    while(itemSize*2 > $('.container').height()-300) {
      itemSize = itemSize*0.98;
    }


    // get all edges
    var edges = network.getEdges({from:network.getNodes({type_t0:'Ego'})[0].id, type:multiBin.options.edgeType});
    var newLine = false;
    // One of these for each bin. One bin for each variable value.
    $.each(multiBin.options.variable.values, function(index, value){

      if (index+1>number && newLine === false) {
        multiBin.options.targetEl.append('<br>');
        newLine = true;
      }
      var newBin = $('<div class="node-bin node-bin-static c'+index+'" data-index="'+index+'"><h1>'+value+'</h1><p class="lead">(Empty)</p><div class="active-node-list"></div></div>');
      newBin.data('index', index);
      multiBin.options.targetEl.append(newBin);
      $(".c"+index).droppable({ accept: ".draggable", 
        drop: function(event, ui) {
          var dropped = ui.draggable;
          var droppedOn = $(this);

          if (multiBin.options.variable.values[index].value>0) {
            $('.followup').show();
            followup = $(dropped).data('node-id');
          }


          $(dropped).appendTo(droppedOn.children('.active-node-list'));
          var properties = {};
          properties[multiBin.options.variable.label] = multiBin.options.variable.values[index];
          // Add the attribute
          var edgeID = network.getEdges({from:network.getNodes({type_t0:'Ego'})[0].id,to:$(dropped).data('node-id'), type:'Dyad'})[0].id;
          console.log(properties);
          console.log(edgeID);
          network.updateEdge(edgeID,properties);
          
          var noun = "people";
          if ($(".c"+index+" .active-node-list").children().length === 1) {
            noun = "person";
          }
          $(".c"+index+" p").html($(".c"+index+" .active-node-list").children().length+' '+noun+'.');

          var el = $(".c"+index);
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



    // $('.node-bin').css({width:itemSize*0.60-20,height:itemSize*0.60-20});
    $('.node-bin').css({width:itemSize-20,height:itemSize-20});
    // $('.node-bin').css({width:itemSize,height:itemSize});


    $('.node-bin h1').css({marginTop: itemSize/3});



    $.each($('.node-bin'), function(index, value) {
      var oldPos = $(value).offset();
      $(value).data('oldPos', oldPos);
      $(value).css(oldPos);
      
    });
    
    $('.node-bin').css({position:'absolute'});      

    // Add edges to bucket or to bins if they already have variable value.
    $.each(edges, function(index,value) {
      if (value[multiBin.options.variable.label] !== undefined && value[multiBin.options.variable.label] !== "") {
          index = multiBin.options.variable.values.indexOf(value[multiBin.options.variable.label]);
          $('.c'+index).children('.active-node-list').append('<div class="node-item draggable" data-node-id="'+value.to+'">'+value.nname_t0+'</div>');
          var noun = "people";
          if ($('.c'+index).children('.active-node-list').children().length === 1) {
            noun = "person";
          }
          if ($('.c'+index).children('.active-node-list').children().length === 0) {
            $('.c'+index).children('p').html('(Empty)');
          } else {
            $('.c'+index).children('p').html($('.c'+index).children('.active-node-list').children().length+' '+noun+'.');
          }  
      } else {
          $('.node-bucket').append('<div class="node-item draggable" data-node-id="'+value.to+'">'+value.nname_t0+'</div>');  
      }

    });
    $(".draggable").draggable({ cursor: "pointer", revert: "invalid", disabled: false });

    // Event Listeners
    window.addEventListener('changeStageStart', stageChangeHandler, false);
    $('.node-bin-static').on("click", nodeBinClickHandler);
    $('.node-item').on("click", nodeClickHandler);
    $('.content').on("click", backgroundClickHandler);
    $(document).on('click', '.followup-option', followupHandler);

  };

  multiBin.init();

  return multiBin;
};
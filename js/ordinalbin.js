/* global network, extend, notify */
/* exported OrdinalBin */
var OrdinalBin = function OrdinalBin(options) {

  //global vars
  var ordinalBin = {};
  ordinalBin.options = {
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

  var open = false;
  extend(ordinalBin.options, options);
  var itemW,itemH;

  var stageChangeHandler = function() {
    ordinalBin.destroy();
  };

  var backgroundClickHandler = function(e) {
    e.stopPropagation();
    if (e.target !== e.currentTarget) {

      if (open === true) {
        $('.container').children().removeClass('invisible');
        $('.copy').removeClass('node-bin-active');
        $('.copy').addClass('node-bin-static');
        // $('.copy').children('h1, p').show();
        // $('.ord-node-bin h1').css({marginTop: itemH/3});
        $('.copy').removeClass('copy'); 
        $(".draggable").draggable({ cursor: "pointer", revert: "invalid", disabled: false });
        open = false;  
      } else {
      }

    }

  };

  var nodeBinClickHandler = function(e) {
    e.stopPropagation();
    
    //reject bin clicks where the bin is already open
    if (open === false) {

      $(".draggable").draggable({ cursor: "pointer", revert: "invalid", disabled: true });
      if(!$(this).hasClass('.node-bin-active')) {
        $('.container').children().not(this).addClass('invisible');
        var position = $(this).offset();
        var nodeBinDetails = $(this);
        nodeBinDetails.offset(position);
        nodeBinDetails.addClass('node-bin-active copy');
        nodeBinDetails.removeClass('node-bin-static');
        // nodeBinDetails.children('h1, p').hide();
        // $('.ord-node-bin h1').css({marginTop: 0});

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
        properties[ordinalBin.options.variable.label] = '';
        network.updateEdge(edgeID,properties);
        $(this).fadeOut(400, function() {
          $(this).appendTo('.node-bucket');
          $(this).css('display', '');
          var noun = "people";
          if ($('.n'+id).children('.active-node-list').children().length === 1) {
            noun = "person";
          }
          if ($('.n'+id).children('.active-node-list').children().length === 0) {
            $('.n'+id).children('p').html('(Empty)');
          } else {
          $('.n'+id).children('p').html($('.n'+id).children('.active-node-list').children().length+' '+noun+'.');
          }

        });
        


      }

  };

  ordinalBin.destroy = function() {
    // Event Listeners
    notify("Destroying ordinalBin.",0);
    window.removeEventListener('changeStageStart', stageChangeHandler, false);
    $('.node-bin-static').off("click", nodeBinClickHandler);
    $('.node-item').off("click", nodeClickHandler);
    $('.content').off("click", backgroundClickHandler);

  };

  ordinalBin.init = function() {
    // Add header and subheader
    ordinalBin.options.targetEl.append('<h1>'+ordinalBin.options.heading+'</h1>');
    ordinalBin.options.targetEl.append('<p class="lead">'+ordinalBin.options.subheading+'</p>');

    // Add node bucket
    ordinalBin.options.targetEl.append('<div class="node-bucket"></div>');

    var number = ordinalBin.options.variable.values.length;
    itemW = ($('.container').outerWidth()/number)-20;
    itemH = $('.container').outerHeight()-300;



    // get all edges
    var edges = network.getEdges({from:network.getNodes({type_t0:'Ego'})[0].id, type:ordinalBin.options.edgeType});

    // One of these for each bin. One bin for each variable value.
    $.each(ordinalBin.options.variable.values, function(index, value){

      var newBin = $('<div class="ord-node-bin node-bin-static n'+index+'" data-index="'+index+'"><h1>'+value.label+'</h1><p class="lead">(Empty)</p><div class="active-node-list"></div></div>');
      newBin.data('index', index);
      ordinalBin.options.targetEl.append(newBin);
      $(".n"+index).droppable({ accept: ".draggable", 
        drop: function(event, ui) {
          var dropped = ui.draggable;
          var droppedOn = $(this);
          $(dropped).appendTo(droppedOn.children('.active-node-list'));
          $(dropped).css({position: '',top:'',left:''});
          var properties = {};
          properties[ordinalBin.options.variable.values[index].label] = ordinalBin.options.variable.values[index].value;
          // Add the attribute
          var edgeID = network.getEdges({from:network.getNodes({type_t0:'Ego'})[0].id,to:$(dropped).data('node-id'), type:'Dyad'})[0].id;
          network.updateEdge(edgeID,properties);
          
          var noun = "people";
          if ($(".n"+index+" .active-node-list").children().length === 1) {
            noun = "person";
          }
          $(".n"+index+" p").html($(".n"+index+" .active-node-list").children().length+' '+noun+'.');

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



    // $('.node-bin').css({width:itemSize*0.60-20,height:itemSize*0.60-20});
    $('.ord-node-bin').css({width:itemW,height:itemH});
    // $('.node-bin').css({width:itemSize,height:itemSize});

    // $('.ord-node-bin h1').css({marginTop: itemH/3});

    $.each($('.ord-node-bin'), function(index, value) {
      var oldPos = $(value).offset();
      $(value).data('oldPos', oldPos);
      $(value).css(oldPos);
      
    });
    
    $('.ord-node-bin').css({position:'absolute'});      

    // Add edges to bucket or to bins if they already have variable value.
    $.each(edges, function(index,value) {
      if (value[ordinalBin.options.variable.label] !== undefined && value[ordinalBin.options.variable.label] !== "") {
          index = ordinalBin.options.variable.values.indexOf(value[ordinalBin.options.variable.label]);
          $('.n'+index).children('.active-node-list').append('<div class="node-item draggable" data-node-id="'+value.to+'">'+value.nname_t0+'</div>');
          var noun = "people";
          if ($('.n'+index).children('.active-node-list').children().length === 1) {
            noun = "person";
          }
          if ($('.n'+index).children('.active-node-list').children().length === 0) {
            $('.n'+index).children('p').html('(Empty)');
          } else {
            $('.n'+index).children('p').html($('.n'+index).children('.active-node-list').children().length+' '+noun+'.');
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

  };

  ordinalBin.init();

  return ordinalBin;
};
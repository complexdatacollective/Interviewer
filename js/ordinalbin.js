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

  extend(ordinalBin.options, options);
  var itemW,itemH;

  var stageChangeHandler = function() {
    ordinalBin.destroy();
  };

  ordinalBin.destroy = function() {
    // Event Listeners
    notify("Destroying ordinalBin.",0);
    window.removeEventListener('changeStageStart', stageChangeHandler, false);

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




    // One of these for each bin. One bin for each variable value.
    $.each(ordinalBin.options.variable.values, function(index, value){

      var newBin = $('<div class="ord-node-bin node-bin-static n'+index+'" data-index="'+index+'"><h1>'+value.label+'</h1><p class="lead">(Empty)</p></div>');
      newBin.data('index', index);
      ordinalBin.options.targetEl.append(newBin);
      $(".n"+index).droppable({ accept: ".draggable", 
        drop: function(event, ui) {
          var dropped = ui.draggable;
          var droppedOn = $(this);
          $(dropped).appendTo(droppedOn);
          $(dropped).css({position: '',top:'',left:''});
          var properties = {};
          properties[ordinalBin.options.variable.label] = ordinalBin.options.variable.values[index].value;
          // Add the attribute
          var edgeID = network.getEdges({from:network.getNodes({type_t0:'Ego'})[0].id,to:$(dropped).data('node-id'), type:'Dyad'})[0].id;
          network.updateEdge(edgeID,properties);

          $.each($('.ord-node-bin'), function(oindex) {
            var length = $(".n"+oindex).children().length-2;
            if (length > 0) {
              var noun = "people";
              if (length === 1) {
                noun = "person";
              }

              $(".n"+oindex+" p").html(length+' '+noun+'.');              
            } else {
              $(".n"+oindex+" p").html('(Empty)');
            }


          });

          var el = $(".n"+index);
            // var origBg = el.css('background-color');
            // el.transition({scale:1.2}, 200, 'ease');
            setTimeout(function(){
              el.transition({background:el.data('oldBg')}, 200, 'ease');
              // el.transition({ scale:1}, 200, 'ease');
            }, 0);
            $(".draggable").draggable({ cursor: "pointer", revert: "invalid", disabled: false, start: function() { $('.ord-node-bin').css({overflow:'visible'}); } });       
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

    // $.each($('.ord-node-bin'), function(index, value) {
    //   var oldPos = $(value).offset();
    //   $(value).data('oldPos', oldPos);
    //   $(value).css(oldPos);
      
    // });
    
    // $('.ord-node-bin').css({position:'absolute'});      

    // get all edges
    var edges = network.getEdges({from:network.getNodes({type_t0:'Ego'})[0].id, type:ordinalBin.options.edgeType});

    // Add edges to bucket or to bins if they already have variable value.
    $.each(edges, function(index,value) {
      if (value[ordinalBin.options.variable.label] !== undefined && value[ordinalBin.options.variable.label] !== "") {
          // index = ordinalBin.options.variable.values.indexOf(value[ordinalBin.options.variable.label]);
          index = 'error';
          $.each(ordinalBin.options.variable.values, function(vindex, vvalue) {
            if (value[ordinalBin.options.variable.label] === vvalue.value) {
              index = vindex;
              console.log('found it! '+vindex);
            }
          });
          $('.n'+index).append('<div class="node-item draggable" data-node-id="'+value.to+'">'+value.nname_t0+'</div>');
          var noun = "people";
          var length = $('.n'+index).children().length - 2;
          if (length === 1) {
            noun = "person";
          }
          if (length === 0) {
            $('.n'+index).children('p').html('(Empty)');
          } else {
            $('.n'+index).children('p').html(length+' '+noun+'.');
          }  
      } else {
          $('.node-bucket').append('<div class="node-item draggable" data-node-id="'+value.to+'">'+value.nname_t0+'</div>');  
      }

    });
    $(".draggable").draggable({ cursor: "pointer", revert: "invalid", disabled: false, start: function() { $('.ord-node-bin').css({overflow:'visible'}); } });

    // Event Listeners
    window.addEventListener('changeStageStart', stageChangeHandler, false);
  };

  ordinalBin.init();

  return ordinalBin;
};